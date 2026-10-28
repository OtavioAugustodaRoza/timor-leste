"""Run the current complete browser verification suite."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name('verify-enhancements.py')), run_name='__main__')