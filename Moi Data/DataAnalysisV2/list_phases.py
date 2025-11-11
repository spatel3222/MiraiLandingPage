#!/usr/bin/env python3
import os
import glob

def list_phases():
    docs_dir = "docs"
    phase_files = glob.glob(f"{docs_dir}/phase-*.md")
    
    phases = []
    for file in phase_files:
        phase_name = os.path.basename(file).replace('.md', '')
        phases.append(phase_name)
    
    phases.sort()
    
    print("Phases found in documentation:")
    for phase in phases:
        print(f"- {phase}")
    
    return phases

if __name__ == "__main__":
    list_phases()