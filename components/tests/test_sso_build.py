from pathlib import Path
import subprocess
import unittest
ROOT = Path(__file__).resolve().parents[1]
class SsoBuildTest(unittest.TestCase):
 def test_standalone_build_and_ui_test(self):
  for target,command in [('build','npm run build'),('test-ui','npm test')]:
   result=subprocess.run(['make','--no-print-directory','-n','-C','sso',target],cwd=ROOT,text=True,capture_output=True,check=True,timeout=30)
   self.assertIn('cd ui &&',result.stdout)
   self.assertIn(command,result.stdout)
if __name__=='__main__':unittest.main()
