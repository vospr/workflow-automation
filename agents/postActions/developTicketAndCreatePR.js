const { execSync } = require('child_process');
const fs = require('fs');

const ticketKey = process.argv[2];

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

try {
  // Read ticket summary for branch name and commit message
  const ticket = JSON.parse(fs.readFileSync(`input/${ticketKey}/ticket.json`, 'utf8'));
  const summary = ticket.fields?.summary || ticketKey;

  // Configure git
  run('git config user.name "AI Teammate"');
  run('git config user.email "ai-teammate@noreply.github.com"');

  // Create branch
  const branchName = `feature/${ticketKey}`;
  run(`git checkout -b ${branchName}`);

  // Stage changes (exclude input/ and outputs/ folders)
  run('git add --all -- ":!input/" ":!outputs/"');

  // Check if there are changes
  const status = run('git status --porcelain');
  if (!status) {
    console.log('No code changes to commit. Posting analysis only.');
    const response = fs.readFileSync('outputs/response.md', 'utf8');
    run(`dmtools jira_post_comment ${ticketKey} "${response.replace(/"/g, '\\"')}"`);
    run(`dmtools jira_remove_label ${ticketKey} "AI"`);
    run(`dmtools jira_add_label ${ticketKey} "AI_PROCESSED"`);
    process.exit(0);
  }

  // Commit and push
  const commitMsg = `${ticketKey} ${summary}`;
  run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  run(`git push -u origin ${branchName}`);

  // Create PR
  const prOutput = run(
    `gh pr create --title "${commitMsg.replace(/"/g, '\\"')}" --body-file outputs/response.md --base main`
  );

  const prUrl = prOutput.match(/https:\/\/github\.com\/[^\s]+/)?.[0] || '';

  // Post comment to Jira
  const comment = [
    'h3. *AI Teammate: Development Completed*',
    '',
    `*Branch:* {code}${branchName}{code}`,
    prUrl ? `*Pull Request:* ${prUrl}` : '',
    '',
    'Ready for review. Merge PR to approve.'
  ].join('\n');

  run(`dmtools jira_post_comment ${ticketKey} "${comment.replace(/"/g, '\\"')}"`);

  // Update labels
  run(`dmtools jira_remove_label ${ticketKey} "AI"`);
  run(`dmtools jira_add_label ${ticketKey} "AI_PROCESSED"`);

  console.log(`Done. PR: ${prUrl}`);

} catch (error) {
  console.error('Error:', error.message);

  // Post failure comment to Jira
  try {
    run(`dmtools jira_post_comment ${ticketKey} "AI Teammate failed: ${error.message.replace(/"/g, '\\"')}"`);
    run(`dmtools jira_remove_label ${ticketKey} "AI"`);
    run(`dmtools jira_add_label ${ticketKey} "AI_FAILED"`);
  } catch (e) {
    console.error('Failed to post error to Jira:', e.message);
  }

  process.exit(1);
}
