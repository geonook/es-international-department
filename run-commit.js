const { execSync } = require('child_process');

try {
  console.log('Adding files to git...');
  execSync('git add .', { stdio: 'inherit' });
  
  console.log('Committing changes...');
  execSync(`git commit -m "feat: Add delightful finishing touches to Parents' Corner page

- Added interactive heart click easter eggs with confetti effects
- Enhanced microinteractions with breathing animations for cards
- Improved family-friendly copy throughout the page
- Added celebration messages for successful data loads
- Enhanced button hover effects with spring animations
- Added random sparkles and interactive floating elements
- Improved loading states with encouraging messages
- Added more warm, welcoming tone to all text
- Enhanced tooltips and success celebrations
- Added heart animations and family-focused messaging

These enhancements make the page more engaging and joyful for parents
while maintaining performance and accessibility."`, { stdio: 'inherit' });
  
  console.log('Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('✅ Successfully committed and pushed delightful enhancements!');
} catch (error) {
  console.error('❌ Error during commit:', error.message);
}