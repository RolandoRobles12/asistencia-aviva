
type SendMessageParams = {
    botToken: string;
    channel: string; // Can be a channel ID or a user ID for DMs
    text: string;
    blocks?: any[]; // Slack blocks for rich formatting
};

type SlackApiResponse = {
    ok: boolean;
    error?: string;
    [key: string]: any;
};

/**
 * Sends a message to a Slack channel or user.
 *
 * @param {SendMessageParams} params - The parameters for sending the message.
 * @returns {Promise<SlackApiResponse>} A promise that resolves to the Slack API response.
 */
export async function sendSlackMessage({
    botToken,
    channel,
    text,
    blocks,
}: SendMessageParams): Promise<SlackApiResponse> {
    
    // In a Node.js environment, you would use a library like 'node-fetch' or 'axios'.
    // Since this is a browser/Next.js server component context, we use the standard Fetch API.
    const fetch = (await import('node-fetch')).default;
    
    try {
        const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${botToken}`,
            },
            body: JSON.stringify({
                channel,
                text, // Fallback text for notifications
                blocks, // Rich message formatting
            }),
        });

        const jsonData = await response.json();
        const data: SlackApiResponse = jsonData as SlackApiResponse;

        if (!response.ok || !data.ok) {
            console.error('Slack API Error:', data.error || `HTTP Status ${response.status}`);
            return { ok: false, error: data.error || `HTTP Status ${response.status}` };
        }

        return data;

    } catch (error) {
        console.error('Failed to send Slack message:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { ok: false, error: errorMessage };
    }
}
