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
conda env create -f 2D-to-3D-converter/linux-environment.yml
conda activate twoD2threeD
```

### Build the 2D-to-3D-converter

```bash
pnpm run converter-pipeline:run
```

### Start the dev App

```bash
pnpm tauri dev
```

Press `Ctrl` + `Shift` + `I` for launching inspector tools in dev app

## Build

You can use the flags:

- --verbose: detailed output
- --debug: for debug build with dev tools

```bash
pnpm tauri build
```

For building appimage, you might want to do

```bash
export NO_STRIP=true
```

### Using Pre-compiled Converter Binaries

If you are using pre-compiled binaries downloaded from GitHub Releases or Artifacts, place the binary in the `src-tauri/binaries/` directory. Ensure the file is named with the appropriate target triple for your platform (e.g., `converter-x86_64-unknown-linux-gnu` or `converter-aarch64-apple-darwin`).

---

![good luck...](https://github.com/me-shaon/GLWTPL/raw/master/good-luck.gif)

...and godspeed.
