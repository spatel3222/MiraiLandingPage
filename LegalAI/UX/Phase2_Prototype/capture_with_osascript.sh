#!/bin/bash

# Screenshot capture script for Mirai360.ai prototypes using macOS tools
echo "📸 Capturing screenshots of prototypes..."

# Get current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Array of prototype files
declare -a prototypes=(
    "option-a-low-minimal.html:Option A - Low Minimal"
    "option_b_medium_minimal.html:Option B - Medium Minimal"
    "option_c_high_minimal.html:Option C - High Minimal"
)

# Function to capture screenshot of a webpage
capture_screenshot() {
    local file="$1"
    local name="$2"
    local output="$3"
    
    echo "📷 Capturing: $name"
    echo "   File: file://$DIR/$file"
    
    # Open file in default browser and capture after delay
    osascript -e "
        tell application \"Safari\"
            activate
            open location \"file://$DIR/$file\"
            delay 3
        end tell
        
        tell application \"System Events\"
            delay 2
            keystroke \"s\" using {shift down, command down}
            delay 1
            keystroke \"$output\"
            delay 1
            key code 36
        end tell
    "
    
    echo "   ✅ Screenshot attempt completed for $name"
}

# Loop through prototypes and capture screenshots
for prototype in "${prototypes[@]}"; do
    IFS=':' read -r file name <<< "$prototype"
    output="${file%.*}_screenshot"
    
    capture_screenshot "$file" "$name" "$output"
    sleep 2
done

echo "🎉 Screenshot capture process complete!"
echo "Check your Desktop or Documents folder for saved screenshots"