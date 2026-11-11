using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Drawing;

namespace MusenixMusical {
    static class Program {
        [STAThread]
        static void Main(string[] args) {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string localIndex = Path.Combine(appDir, "app", "index.html");
            string onlineUrl = "https://musenixmusical.netlify.app";

            // Prioritize Edge / Chrome App Mode for frameless modern desktop player experience
            string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edgePath)) {
                edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }

            string chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
            if (!File.Exists(chromePath)) {
                chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
            }

            string targetUrl = File.Exists(localIndex) ? new Uri(localIndex).AbsoluteUri : onlineUrl;
            string browserPath = File.Exists(edgePath) ? edgePath : (File.Exists(chromePath) ? chromePath : null);

            if (browserPath != null) {
                try {
                    ProcessStartInfo psi = new ProcessStartInfo {
                        FileName = browserPath,
                        Arguments = "--app=" + targetUrl + " --window-size=1200,800",
                        UseShellExecute = true
                    };
                    Process.Start(psi);
                    return;
                } catch {
                    // Fallback to default browser
                }
            }

            // Fallback: Launch in default system browser
            try {
                Process.Start(new ProcessStartInfo {
                    FileName = targetUrl,
                    UseShellExecute = true
                });
            } catch (Exception ex) {
                MessageBox.Show("Gagal membuka MUSENIX Musical Desktop: " + ex.Message, "MUSENIX Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
