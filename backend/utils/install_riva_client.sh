#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2022 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: MIT

# Installation script for Riva Python Client
# This script sets up the required protobuf files and installs the package

set -e

echo "======================================================================"
echo "Installing Riva Python Client"
echo "======================================================================"

# Initialize and update git submodules
echo ""
echo "Step 1: Initializing git submodules..."
git submodule init
git submodule update --remote --recursive

# Install requirements
echo ""
echo "Step 2: Installing requirements..."
pip install -r requirements.txt

# Build the wheel
echo ""
echo "Step 3: Building wheel package..."
python3 setup.py bdist_wheel

# Install the wheel
echo ""
echo "Step 4: Installing the package..."
pip install --force-reinstall dist/*.whl

echo ""
echo "======================================================================"
echo "Installation complete!"
echo "======================================================================"
echo ""
echo "You can now use the transcribe_offline_function.py module."
echo ""
