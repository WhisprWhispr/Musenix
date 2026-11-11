using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace MusenixMusical {
    static class Program {
        [STAThread]
        static void Main(string[] args) {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string localAppDir = Path.Combine(appDir, "app");
            string onlineUrl = "https://musenixmusical.netlify.app";
            string targetUrl = onlineUrl;
            HttpListener listener = null;

            // Start internal local HTTP server for local Flutter Web offline bundle
            if (Directory.Exists(localAppDir) && File.Exists(Path.Combine(localAppDir, "index.html"))) {
                try {
                    int port = new Random().Next(49200, 59900);
                    listener = new HttpListener();
                    listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                    listener.Start();

                    ThreadPool.QueueUserWorkItem((_) => {
                        while (listener != null && listener.IsListening) {
                            try {
                                var ctx = listener.GetContext();
                                ThreadPool.QueueUserWorkItem((c) => ServeFile((HttpListenerContext)c, localAppDir), ctx);
                            } catch { break; }
                        }
                    });

                    targetUrl = "http://127.0.0.1:" + port + "/index.html";
                } catch {
                    targetUrl = onlineUrl;
                }
            }

            // Detect Microsoft Edge or Google Chrome for native frameless app window (--app)
            string edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edge)) {
                edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }

            string chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
            if (!File.Exists(chrome)) {
                chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
            }

            string browser = File.Exists(edge) ? edge : (File.Exists(chrome) ? chrome : null);

            bool launched = false;
            if (browser != null) {
                try {
                    ProcessStartInfo psi = new ProcessStartInfo {
                        FileName = browser,
                        Arguments = "--app=\"" + targetUrl + "\" --window-size=1240,820",
                        UseShellExecute = true
                    };
                    Process.Start(psi);
                    launched = true;
                } catch {}
            }

            if (!launched) {
                try {
                    Process.Start(new ProcessStartInfo {
                        FileName = targetUrl,
                        UseShellExecute = true
                    });
                } catch (Exception ex) {
                    MessageBox.Show("Gagal membuka MUSENIX Musical: " + ex.Message, "MUSENIX Musical", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }

            // Keep listener alive while user is playing music
            if (listener != null) {
                Thread.Sleep(4000);
                while (IsBrowserOpen()) {
                    Thread.Sleep(1500);
                }
                try { listener.Stop(); } catch {}
            }
        }

        private static bool IsBrowserOpen() {
            var p1 = Process.GetProcessesByName("msedge");
            var p2 = Process.GetProcessesByName("chrome");
            return (p1.Length > 0 || p2.Length > 0);
        }

        private static void ServeFile(HttpListenerContext ctx, string rootDir) {
            try {
                string urlPath = ctx.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(urlPath)) urlPath = "index.html";
                string filePath = Path.Combine(rootDir, urlPath.Replace('/', Path.DirectorySeparatorChar));

                if (!File.Exists(filePath)) {
                    filePath = Path.Combine(rootDir, "index.html");
                }

                byte[] bytes = File.ReadAllBytes(filePath);
                ctx.Response.ContentType = GetMimeType(filePath);
                ctx.Response.ContentLength64 = bytes.Length;
                ctx.Response.AddHeader("Access-Control-Allow-Origin", "*");
                ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
                ctx.Response.OutputStream.Close();
            } catch {
                try {
                    ctx.Response.StatusCode = 404;
                    ctx.Response.Close();
                } catch {}
            }
        }

        private static string GetMimeType(string path) {
            string ext = Path.GetExtension(path).ToLowerInvariant();
            switch (ext) {
                case ".html": return "text/html; charset=utf-8";
                case ".js": case ".mjs": return "application/javascript; charset=utf-8";
                case ".json": return "application/json";
                case ".css": return "text/css; charset=utf-8";
                case ".png": return "image/png";
                case ".jpg": case ".jpeg": return "image/jpeg";
                case ".ico": return "image/x-icon";
                case ".svg": return "image/svg+xml";
                case ".wasm": return "application/wasm";
                case ".mp3": return "audio/mpeg";
                case ".m4a": return "audio/mp4";
                case ".ttf": return "font/ttf";
                case ".otf": return "font/otf";
                case ".woff": return "font/woff";
                case ".woff2": return "font/woff2";
                default: return "application/octet-stream";
            }
        }
    }
}
