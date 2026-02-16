const { execSync } = require('child_process');
const fs = require('fs');

const ticketKey = process.argv[2];

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

try {
  // Find existing PR branch
  const branchName = `feature/${ticketKey}`;

  // Checkout existing branch
  run(`git fetch origin ${branchName}`);
  run(`git checkout ${branchName}`);

  // Configure git
  run('git config user.name "AI Teammate"');
  run('git config user.email "ai-teammate@noreply.github.com"');

  // Stage changes
  run('git add --all -- ":!input/" ":!outputs/"');

  const status = run('git status --porcelain');
  if (!status) {
    console.log('No changes from review fix.');
    process.exit(0);
  }

  // Commit and push to existing branch (PR auto-updates)
  run(`git commit -m "${ticketKey} Address review feedback"`);
  run(`git push origin ${branchName}`);

  // Post comment to Jira
  run(`dmtools jira_post_comment ${ticketKey} "AI Teammate: Review feedback addressed. PR updated."`);

  // Update labels
  run(`dmtools jira_remove_label ${ticketKey} "AI-Review"`);
  run(`dmtools jira_add_label ${ticketKey} "AI_PROCESSED"`);

  console.log('PR updated from review feedback.');

} catch (error) {
  console.error('Error:', error.message);
  try {
    run(`dmtools jira_post_comment ${ticketKey} "AI Teammate review fix failed: ${error.message.replace(/"/g, '\\"')}"`);
  } catch (e) {
    console.error('Failed to post error:', e.message);
  }
  process.exit(1);
}
