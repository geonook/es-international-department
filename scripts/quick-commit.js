const { exec } = require('child_process');
const path = require('path');

// Change to the project directory
process.chdir('/Users/chenzehong/Desktop/es-international-department (2)');

// Execute git commands
const commands = [
  'git add app/parents/page.tsx',
  'git commit -m "enhance: Complete Parents page visual redesign with family-friendly UI improvements\n\nMAJOR VISUAL ENHANCEMENTS:\n- Enhanced background animations with floating heart and handshake elements\n- Improved LINE Bot floating button with pulsing ring effects and family-friendly tooltip\n- Enhanced hero section with animated heart/sparkles icons and dynamic gradient text\n- Upgraded call-to-action buttons with smooth hover animations and better family-focused copy\n\nCOMMUNICATION SECTION IMPROVEMENTS:\n- Redesigned communication header with animated icons and informative badges\n- Enhanced communication list items with detailed descriptions and smooth animations\n- Added comprehensive family support buttons with professional email templates\n- Improved visual hierarchy with gradient backgrounds and better spacing\n\nPORTAL SECTION REDESIGN:\n- Enhanced Parent Portal header with animated icons and descriptive text\n- Redesigned notification cards with animated backgrounds and better content organization\n- Upgraded School Calendar card with informative grid layout and enhanced styling\n- Added smooth hover effects and micro-interactions throughout\n- Implemented family-friendly color schemes and consistent visual patterns\n\nTECHNICAL IMPROVEMENTS:\n- Added responsive animations and loading states\n- Enhanced accessibility with better color contrast and icon usage\n- Improved mobile-first responsive design principles\n- Added professional email templates for parent communication"',
  'git push origin main'
];

commands.forEach((command, index) => {
  setTimeout(() => {
    console.log(`Executing: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      
      if (index === commands.length - 1) {
        console.log('✅ All git operations completed successfully!');
      }
    });
  }, index * 2000); // 2 second delay between commands
});