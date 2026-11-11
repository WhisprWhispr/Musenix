const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, 'public', 'images', 'logo.png');
const iconBase64 = fs.readFileSync(iconPath).toString('base64');

const mobileConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>
${iconBase64}
            </data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>MUSENIX</string>
            <key>PayloadDescription</key>
            <string>Aplikasi Resmi MUSENIX Musical untuk Layar Utama iOS</string>
            <key>PayloadDisplayName</key>
            <string>MUSENIX Musical</string>
            <key>PayloadIdentifier</key>
            <string>com.musenix.musical.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>3A4D2E1B-9876-4321-ABCD-EF0123456789</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>http://localhost:3000</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Instalasi aplikasi MUSENIX Musical langsung ke iPhone tanpa App Store.</string>
    <key>PayloadDisplayName</key>
    <string>MUSENIX Musical iOS App</string>
    <key>PayloadIdentifier</key>
    <string>com.musenix.musical.profile</string>
    <key>PayloadOrganization</key>
    <string>MUSENIX Team</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>1B2C3D4E-5F6A-7B8C-9D0E-1F2A3B4C5D6E</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

const dest = path.join(__dirname, 'public', 'downloads', 'musenix-musical.mobileconfig');
fs.writeFileSync(dest, mobileConfig, 'utf8');
console.log('Mobileconfig created successfully at', dest, 'Size:', fs.statSync(dest).size);

