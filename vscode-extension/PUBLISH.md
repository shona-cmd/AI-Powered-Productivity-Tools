# Publishing to VS Code Marketplace

## Option 1: Manual Publishing

1. **Create a Microsoft Account**
   - Go to https://account.microsoft.com

2. **Create a Publisher**
   - Go to https://marketplace.visualstudio.com/manage
   - Click "Create publisher"
   - Fill in the details:
     - Publisher Name: `ai-productivity-tools`
     - Display Name: `AI Productivity Tools`
     - Description: Your description

3. **Get Publisher ID**
   - Copy your publisher ID from the URL (e.g., `https://marketplace.visualstudio.com/publishers/YOUR_PUBLISHER_ID`)

4. **Update package.json**
   
```
json
   "publisher": "YOUR_PUBLISHER_ID"
   
```

5. **Login to VSCE**
   
```
bash
   vsce login YOUR_PUBLISHER_ID
   
```

6. **Publish**
   
```
bash
   vsce publish
   
```

## Option 2: GitHub Release (Automatic)

Create a release on GitHub and the extension will be packaged automatically.

1. Go to GitHub Releases
2. Create a new release with tag `v1.0.0`
3. Upload the `.vsix` file as an asset

## Files Ready for Publishing

- `vscode-extension/ai-productivity-tools-1.0.0.vsix` - The packaged extension
- `vscode-extension/package.json` - Extension manifest
- `vscode-extension/README.md` - Extension documentation
- `vscode-extension/LICENSE` - MIT License

## Installation from VSIX

Users can also install directly from the `.vsix` file:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Click "..." menu
4. Select "Install from VSIX"
5. Choose the `ai-productivity-tools-1.0.0.vsix` file
