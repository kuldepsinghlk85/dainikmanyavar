package in.dainikmanyawar.app;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    public static final String SITE_URL = "https://dainikmanyavar.com/mobile";
    public static final String BACKUP_URL = "https://dainikmanyawar.in/mobile";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout offlineLayout;
    private Button btnRetry;

    private ValueCallback<Uri[]> fileUploadCallback;
    private ActivityResultLauncher<Intent> fileChooserLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        offlineLayout = findViewById(R.id.offlineLayout);
        btnRetry = findViewById(R.id.btnRetry);

        initFileChooser();
        setupWebView();
        setupSwipeRefresh();
        setupBackNavigation();

        btnRetry.setOnClickListener(v -> loadApp());

        if (savedInstanceState == null) {
            loadApp();
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void initFileChooser() {
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (fileUploadCallback == null) return;
                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        if (result.getData().getClipData() != null) {
                            int count = result.getData().getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = result.getData().getClipData().getItemAt(i).getUri();
                            }
                        } else if (result.getData().getData() != null) {
                            results = new Uri[]{result.getData().getData()};
                        }
                    }
                    fileUploadCallback.onReceiveValue(results);
                    fileUploadCallback = null;
                }
        );
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Customize user-agent so server knows this is an Android mobile app
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " DainikManyavarApp/1.0 (Android; Mobile)");

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                            FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    fileChooserLauncher.launch(intent);
                } catch (Exception e) {
                    fileUploadCallback = null;
                    Toast.makeText(MainActivity.this, "फाइल चयनकर्ता नहीं खोला जा सका", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                return handleUrl(url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                offlineLayout.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                swipeRefresh.setRefreshing(false);
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame() && !isNetworkConnected()) {
                    showOffline();
                }
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimetype);
                String cookies = CookieManager.getInstance().getCookie(url);
                request.addRequestHeader("cookie", cookies);
                request.addRequestHeader("User-Agent", userAgent);
                request.setDescription("डाउनलोड हो रहा है...");
                request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype));
                request.allowScanningByMediaScanner();
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS,
                        URLUtil.guessFileName(url, contentDisposition, mimetype));

                DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    Toast.makeText(getApplicationContext(), "डाउनलोड शुरू हो गया...", Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Exception ex) {
                    Toast.makeText(getApplicationContext(), "डाउनलोड करने में असमर्थ", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private boolean handleUrl(String url) {
        if (url == null) return false;

        // WhatsApp links
        if (url.startsWith("whatsapp:") || url.contains("api.whatsapp.com") || url.contains("wa.me")) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            } catch (Exception e) {
                Toast.makeText(this, "WhatsApp इंस्टॉल नहीं है", Toast.LENGTH_SHORT).show();
                return true;
            }
        }

        // Phone call
        if (url.startsWith("tel:")) {
            try {
                Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                startActivity(intent);
                return true;
            } catch (Exception e) {
                return true;
            }
        }

        // Email
        if (url.startsWith("mailto:")) {
            try {
                Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
                startActivity(intent);
                return true;
            } catch (Exception e) {
                return true;
            }
        }

        // Internal Dainik Manyavar navigation
        if (url.contains("dainikmanyavar.com") || url.contains("dainikmanyawar.in") || url.contains("localhost")) {
            return false; // Load inside WebView
        }

        // External URLs - open in browser
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void setupSwipeRefresh() {
        swipeRefresh.setColorSchemeResources(R.color.primary);
        swipeRefresh.setOnRefreshListener(() -> {
            if (isNetworkConnected()) {
                webView.reload();
            } else {
                swipeRefresh.setRefreshing(false);
                showOffline();
            }
        });
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            private long backPressedTime = 0;

            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    if (backPressedTime + 2000 > System.currentTimeMillis()) {
                        setEnabled(false);
                        getOnBackPressedDispatcher().onBackPressed();
                    } else {
                        Toast.makeText(MainActivity.this, "बाहर निकलने के लिए फिर से दबाएं", Toast.LENGTH_SHORT).show();
                        backPressedTime = System.currentTimeMillis();
                    }
                }
            }
        });
    }

    private void loadApp() {
        if (isNetworkConnected()) {
            offlineLayout.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(SITE_URL);
        } else {
            showOffline();
        }
    }

    private void showOffline() {
        webView.setVisibility(View.GONE);
        offlineLayout.setVisibility(View.VISIBLE);
        swipeRefresh.setRefreshing(false);
        progressBar.setVisibility(View.GONE);
    }

    private boolean isNetworkConnected() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        }
        return false;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }
}
