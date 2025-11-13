#!/usr/bin/env python3
"""
Screenshot capture for Mirai360.ai prototype iterations
"""

import asyncio
import os
from playwright.async_api import async_playwright

async def capture_iteration_screenshot(iteration_number):
    """Capture screenshot of specific iteration"""
    
    # File mapping
    file_name = f"option_a_iteration_{iteration_number}.html"
    output_name = f"iteration_{iteration_number}_screenshot.png"
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = f"file://{current_dir}/{file_name}"
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Set viewport to desktop resolution
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        try:
            print(f"📸 Capturing screenshot for Iteration {iteration_number}")
            print(f"   File: {file_path}")
            
            # Navigate to prototype
            await page.goto(file_path, wait_until="networkidle")
            
            # Wait for any animations to complete
            await page.wait_for_timeout(3000)
            
            # Capture full page screenshot
            screenshot_path = os.path.join(current_dir, output_name)
            await page.screenshot(
                path=screenshot_path,
                full_page=True,
                type="png"
            )
            
            print(f"   ✅ Screenshot saved: {screenshot_path}")
            return screenshot_path
            
        except Exception as e:
            print(f"   ❌ Error capturing iteration {iteration_number}: {str(e)}")
            return None
        finally:
            await browser.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        iteration = sys.argv[1]
        asyncio.run(capture_iteration_screenshot(iteration))
    else:
        print("Usage: python screenshot_iteration.py <iteration_number>")