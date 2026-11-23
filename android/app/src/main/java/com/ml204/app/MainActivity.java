package com.ml204.app;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    public static class AndroidDownloaderInterface {
        private final Context context;

        public AndroidDownloaderInterface(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void downloadFile(String url, String filename, String mimeType) {
            try {
                if (url == null || url.isEmpty()) return;

                Uri uri = Uri.parse(url);
                DownloadManager.Request request = new DownloadManager.Request(uri);

                if (mimeType != null && !mimeType.isEmpty()) {
                    request.setMimeType(mimeType);
                }

                String cookies = CookieManager.getInstance().getCookie(url);
                if (cookies != null) {
                    request.addRequestHeader("cookie", cookies);
                }

                String resolvedName = (filename != null && !filename.isEmpty()) 
                    ? filename 
                    : URLUtil.guessFileName(url, null, mimeType);

                request.setTitle(resolvedName);
                request.setDescription("Downloading " + resolvedName);
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, resolvedName);

                DownloadManager dm = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    if (context instanceof MainActivity) {
                        ((MainActivity) context).runOnUiThread(() ->
                            Toast.makeText(context, "Downloading " + resolvedName + " to Downloads...", Toast.LENGTH_SHORT).show()
                        );
                    }
                }
            } catch (Exception e) {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                } catch (Exception ignored) {}
            }
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        AndroidDownloaderInterface downloader = new AndroidDownloaderInterface(this);

        // Expose AndroidDownloader to JavaScript window
        webView.addJavascriptInterface(downloader, "AndroidDownloader");

        // Intercept native webview download events
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
            downloader.downloadFile(url, filename, mimetype);
        });
    }
}
