const fs = require('fs');
const path = require('path');

const configPath = process.argv[2];
const ticketKey = process.argv[3];

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const params = config.params.agentParams;

// Read ticket context
const ticketData = fs.readFileSync(`input/${ticketKey}/ticket.json`, 'utf8');
const childrenData = fs.readFileSync(`input/${ticketKey}/children.json`, 'utf8');

let prompt = `You are: ${params.aiRole}\n\n`;
prompt += `## Ticket Context\n\n`;
prompt += `${ticketData}\n\n`;
prompt += `## Child Tickets\n\n`;
prompt += `${childrenData}\n\n`;
prompt += `## Instructions\n\n`;
prompt += params.instructions.join('\n');
prompt += `\n\n## Formatting Rules\n\n${params.formattingRules || 'Markdown'}`;
prompt += `\n\n## Known Info\n\n${params.knownInfo || 'None'}`;
prompt += `\n\n## Output\n\nWrite your complete response to outputs/response.md`;
prompt += `\nDO NOT create git branches, commit, or push code.`;
prompt += `\nIf you need more Jira data, use: dmtools jira_get_ticket TICKET-KEY fields`;
prompt += `\nIf you need to search Jira, use: dmtools jira_search_by_jql "JQL" "fields"`;

process.stdout.write(prompt);
