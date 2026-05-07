# NS3

## Requirements

- pnpm
- miniconda or any conda distribution
- tauri dependencies, refer for your platform on the [offical docs](https://tauri.app/start/prerequisites/)

## Dev Setup

### Clone the repo with submodules

```bash
git clone git@github.com:lovelindhoni/SIH1773
cd SIH1773
git submodule update --init --recursive
```

### Install NPM dependencies

```bash
pnpm install
```

### Setup the conda environment

```bash
conda env create -f Le_Edificio/linux-environment.yml
conda activate twoD2threeD
```

### Build the Converter Binary

```bash
pnpm run converter-pipeline:run
```

### Start the dev App

```bash
pnpm tauri dev
```

Press `Ctrl` + `Shift` + `I` for launching inspector tools in dev app

## Build (Production)

### How the backend works in each mode

| Mode               | What runs                                       | Requirement                                  |
| ------------------ | ----------------------------------------------- | -------------------------------------------- |
| `pnpm tauri dev`   | `python3 ../Le_Edificio/main.py` via shell      | Python + conda env active on **dev machine** |
| `pnpm tauri build` | `src-tauri/binaries/converter-<triple>` sidecar | Binary must exist **before** building        |

---

### Step 1 — Build the Python converter binary

The converter is compiled with PyInstaller into a standalone executable that bundles Python and all dependencies. The end user does **not** need Python installed.

Make sure the conda environment is active first:

```bash
conda activate twoD2threeD
```

Then run the pipeline script:

```bash
pnpm run converter-pipeline:run
```

This will:

1. Run PyInstaller on `Le_Edificio/main.py`
2. Detect your platform's Rust target triple (e.g. `x86_64-unknown-linux-gnu`)
3. Move the binary to `src-tauri/binaries/converter-<target-triple>[.exe]`

### Step 2 — Verify the binary is in the right place

Before running `pnpm tauri build`, confirm the binary exists at the correct path:

```
src-tauri/
  binaries/
    converter-x86_64-unknown-linux-gnu        ← Linux x86_64
    converter-aarch64-unknown-linux-gnu       ← Linux ARM64
    converter-x86_64-apple-darwin             ← macOS Intel
    converter-aarch64-apple-darwin            ← macOS Apple Silicon
    converter-x86_64-pc-windows-msvc.exe      ← Windows x86_64
```

To find your exact target triple, run:

```bash
rustc -vV | grep host
```

The binary **must** match this triple exactly, or Tauri will fail to bundle it and the app will crash silently on launch.

### Step 3 — Build the app

You can use the flags:

- `--verbose` for detailed output
- `--debug` for a debug build with dev tools enabled

```bash
pnpm tauri build
```

For building an AppImage on Linux, set this first to avoid stripping errors:

```bash
export NO_STRIP=true
pnpm tauri build
```

---

### Using Pre-compiled Converter Binaries

If you have a pre-compiled binary from GitHub Releases or CI artifacts, place it directly in `src-tauri/binaries/` and rename it to match your target triple (see table above). You can skip `pnpm run converter-pipeline:run` in this case.

---

### Troubleshooting Production Builds

| Symptom                                           | Likely cause                              | Fix                                                |
| ------------------------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| App launches but conversion does nothing          | Binary not found at runtime               | Check binary name matches `rustc -vV \| grep host` |
| `pnpm tauri build` fails with "sidecar not found" | Binary missing from `src-tauri/binaries/` | Run `pnpm run converter-pipeline:run` first        |
| Binary exists but crashes immediately             | Built on wrong OS/arch                    | Rebuild the binary on the target platform          |
| Works in dev but not in production build          | `PYTHONUNBUFFERED` or path issue          | Check app logs via `--debug` build                 |

---

![good luck...](https://github.com/me-shaon/GLWTPL/raw/master/good-luck.gif)

...and godspeed.
