#!/usr/bin/env python3
"""
Screenshot Capture Script for Mirai360.ai Prototypes
Captures visual screenshots for CLAIAS framework evaluation
"""

import asyncio
import os
from playwright.async_api import async_playwright

async def capture_prototype_screenshots():
    """Capture screenshots of all 3 prototype options"""
    
    # Define prototype files and output names
    prototypes = [
        {
            "file": "option-a-low-minimal.html",
            "output": "option_a_low_minimal_screenshot.png",
            "name": "Option A - Low Minimal (Rich Visual)"
        },
        {
            "file": "option_b_medium_minimal.html", 
            "output": "option_b_medium_minimal_screenshot.png",
            "name": "Option B - Medium Minimal (Balanced)"
        },
        {
            "file": "option_c_high_minimal.html",
            "output": "option_c_high_minimal_screenshot.png", 
            "name": "Option C - High Minimal (Maximum Simplicity)"
        }
    ]
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Set viewport to simulate desktop experience
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        for prototype in prototypes:
            try:
                # Construct file path
                file_path = f"file://{current_dir}/{prototype['file']}"
                
                print(f"📸 Capturing screenshot for {prototype['name']}")
                print(f"   File: {file_path}")
                
                # Navigate to prototype
                await page.goto(file_path, wait_until="networkidle")
                
                # Wait a moment for any animations to complete
                await page.wait_for_timeout(2000)
                
                # Capture full page screenshot
                screenshot_path = os.path.join(current_dir, prototype['output'])
                await page.screenshot(
                    path=screenshot_path,
                    full_page=True,
                    type="png"
                )
                
                print(f"   ✅ Screenshot saved: {screenshot_path}")
                
            except Exception as e:
                print(f"   ❌ Error capturing {prototype['name']}: {str(e)}")
        
        await browser.close()
        
    print("\n🎉 Screenshot capture complete!")
    print("Files saved in:", current_dir)

if __name__ == "__main__":
    asyncio.run(capture_prototype_screenshots())