# AI Configuration Settings - User Guide

## Overview

The **AI Configuration Settings** interface provides comprehensive control over Claude API parameters, enabling you to fine-tune content generation, manage costs, configure retry behavior, and optimize API performance for your specific needs.

## Accessing AI Configuration

1. Click on your **user avatar** in the top-right corner of the screen
2. Select **"AI Configuration"** from the dropdown menu
3. The AI Configuration interface will open with 5 configuration tabs

## Configuration Tabs

### 1. Model Configuration Tab

Control Claude API model selection and generation parameters.

#### Claude Model Selection
Choose from available Claude models based on your needs:
- **Claude Sonnet 4.5** - Latest model with best balance
- **Claude 3.5 Sonnet** - Previous generation with good performance
- **Claude Opus** - Highest quality, higher cost
- **Claude Haiku** - Fastest, lowest cost

Each model displays:
- Context window size (tokens)
- Input/output pricing per 1,000 tokens
- Supported features (text, vision, tool use)

#### Temperature Control (0.0 - 1.0)
Controls randomness in generation:
- **Low (0.0-0.3)**: More deterministic, focused, consistent
- **Medium (0.4-0.7)**: Balanced creativity and consistency
- **High (0.8-1.0)**: More creative, varied, exploratory

**Recommended**: Start with 0.7 for balanced results.

#### Max Output Tokens (1 - 4,096)
Maximum number of tokens in generated responses:
- **Lower values**: Shorter, more concise responses
- **Higher values**: Longer, more detailed responses
- **Default**: 4,096 (maximum allowed)

#### Top P / Nucleus Sampling (0.0 - 1.0)
Alternative sampling method to temperature:
- Controls diversity of word selection
- **Recommended**: Use either Temperature OR Top P, not both
- **Default**: 0.9

#### Streaming
Enable or disable token-by-token response streaming:
- **Enabled**: See responses appear gradually
- **Disabled**: Wait for complete response
- **Recommended**: Disable for batch operations

#### Cost Estimation
Real-time display of:
- Input cost per 1,000 tokens
- Output cost per 1,000 tokens
- Estimated cost per conversation
- Estimated cost for 100 conversations

### 2. Rate Limiting & Retry Tab

Configure API request rates and automatic retry behavior.

#### Rate Limiting

**Requests Per Minute (1-1,000)**
- Maximum API requests allowed per minute
- Prevents throttling from Claude API
- **Recommended**: Start with 50, increase based on your API limits

**Concurrent Requests (1-20)**
- Number of simultaneous API requests
- Higher values = faster batch processing
- **Recommended**: 3-5 for stability

**Burst Allowance (0-100)**
- Extra requests allowed in short bursts
- Provides flexibility during peak usage
- **Default**: 10

**Rate Limit Summary**
- Sustained rate: Regular request rate
- Peak rate: Maximum with burst allowance
- Parallel processing: Concurrent request limit

#### Retry Strategy

**Max Retries (0-10)**
- Number of retry attempts after initial failure
- **Recommended**: 3 retries for reliability
- Set to 0 to disable retries

**Backoff Strategy**
Choose how delay increases between retries:
- **Exponential (Recommended)**: Delay doubles each retry (1s, 2s, 4s, 8s...)
- **Linear**: Delay increases steadily (1s, 2s, 3s, 4s...)
- **Fixed**: Same delay each retry (1s, 1s, 1s, 1s...)

**Base Delay (100ms - 60s)**
- Initial delay before first retry
- **Default**: 1,000ms (1 second)

**Max Delay (1s - 5min)**
- Maximum delay cap for exponential backoff
- **Default**: 16,000ms (16 seconds)

**Backoff Progression Chart**
- Visual display of retry delays
- Shows total potential wait time
- Helps understand retry behavior

### 3. Cost Management Tab

Set spending limits and receive budget alerts.

#### Budget Configuration

**Daily Budget (USD)**
- Maximum spending allowed per day
- Resets at midnight UTC
- **Example**: $100.00

**Weekly Budget (USD)**
- Maximum spending allowed per week
- Must be ≥ Daily Budget
- **Example**: $500.00

**Monthly Budget (USD)**
- Maximum spending allowed per month
- Must be ≥ Weekly Budget
- **Example**: $2,000.00

#### Alert Thresholds

Configure up to 3 alert thresholds (as percentages):
- **Alert 1**: Often set to 50% (warning)
- **Alert 2**: Often set to 75% (caution)
- **Alert 3**: Often set to 90% (critical)

You'll receive notifications when spending reaches these thresholds.

#### Budget Summary

Displays:
- Daily, weekly, and monthly limits
- Alert threshold percentages
- Estimated daily conversation capacity

**Capacity Calculation**:
Based on selected model and max tokens, shows approximately how many conversations you can generate with your daily budget.

### 4. API Keys Tab

Manage Claude API keys and rotation settings.

#### Primary API Key
- Your active Claude API key
- Required for all API operations
- Format: `sk-ant-...`
- Click the eye icon to show/hide

#### Secondary API Key (Optional)
- Backup key for rotation
- Used for seamless key rotation
- Click the eye icon to show/hide

**Security Notice**: API keys are encrypted at rest. Only the last 4 characters are displayed for security.

#### Key Version
- Automatically incremented when keys are rotated
- Read-only field
- Helps track key rotation history

#### Rotation Schedule
Configure automatic key rotation:
- **Manual**: Rotate keys manually as needed
- **Monthly**: Automatic rotation every 30 days
- **Quarterly**: Automatic rotation every 90 days

**Best Practice**: Use quarterly rotation for security without frequent disruption.

#### Key Configuration Status
Displays:
- Primary key configured: Yes/No
- Secondary key configured: Yes/No
- Current version number
- Rotation policy

### 5. Timeouts Tab

Configure timeout values for API operations.

#### Generation Timeout (1s - 10min)
Maximum time to wait for content generation:
- **Short timeouts (30-60s)**: For quick responses
- **Long timeouts (2-5min)**: For complex, detailed content
- **Default**: 60 seconds

#### Connection Timeout (1s - 60s)
Maximum time to establish API connection:
- Time to connect to Claude API servers
- **Default**: 10 seconds
- **Recommended**: Keep at default unless experiencing connection issues

#### Total Request Timeout (1s - 15min)
Maximum time for entire request lifecycle:
- Includes connection + generation + retries
- Must be longer than generation timeout
- **Default**: 120 seconds (2 minutes)

#### Understanding Timeouts

**Connection Timeout**: How long to wait for initial connection  
**Generation Timeout**: How long to wait for Claude to respond  
**Total Request Timeout**: Maximum time for everything combined

**Example Timeline**:
```
Connection (10s) → Generation (60s) → Retry if needed (70s) = Total (140s)
```

## Configuration Preview

At the bottom of the screen, you'll see a **Configuration Preview** panel showing:
- Your current effective configuration
- Any unsaved changes (highlighted)
- Complete JSON representation

This preview updates in real-time as you make changes, helping you understand the full configuration before saving.

## Saving Configuration

### Making Changes
1. Navigate to any tab
2. Adjust configuration values
3. See live preview at the bottom
4. Continue editing across tabs

### Saving Changes
1. Click **"Save Changes"** button (top-right)
2. Watch for save status:
   - 🔵 **Blue spinner**: Saving...
   - ✅ **Green checkmark**: Saved successfully
   - ❌ **Red X**: Save failed

3. Review any validation errors (displayed above tabs)
4. Fix errors and save again if needed

### Validation Errors

If validation fails, you'll see:
- Red alert box above tabs
- List of specific errors
- Save button remains enabled to try again after fixes

**Common Validation Errors**:
- Temperature not between 0 and 1
- Max tokens out of range (1-4096)
- Weekly budget less than daily budget
- Max delay less than base delay

### Resetting Changes
- Click **"Reset"** button to discard all unsaved changes
- Confirmation required to prevent accidental loss
- Returns all fields to last saved state

## Change History

### Viewing History
1. Click **"History"** button (top-right)
2. View list of recent configuration changes
3. See who made changes and when
4. Review what was changed

### History Details
Each entry shows:
- Change timestamp
- User who made the change
- Type of change
- Description of what changed
- Previous and new values

### Rollback (Future Feature)
The rollback feature will allow you to restore previous configurations. Currently displayed as placeholder.

## Best Practices

### Model Selection
- **Production**: Use Claude Sonnet 4.5 for best balance
- **Testing**: Use Claude Haiku for fast, low-cost testing
- **High Quality**: Use Claude Opus for critical content

### Temperature Settings
- **Consistent Output**: 0.0 - 0.3
- **Balanced**: 0.5 - 0.7 (recommended)
- **Creative**: 0.8 - 1.0

### Rate Limiting
- Start conservatively (50 req/min, 3 concurrent)
- Monitor for throttling errors
- Increase gradually based on API limits

### Retry Strategy
- Use exponential backoff (recommended)
- 3 retries covers most transient failures
- 1s base delay, 16s max delay works well

### Cost Management
- Set realistic daily budgets
- Use 50%, 75%, 90% alert thresholds
- Monitor actual spending weekly

### API Keys
- Keep secondary key configured for smooth rotation
- Use quarterly rotation for security
- Never share keys or commit to version control

### Timeouts
- 60s generation timeout for most cases
- Increase for complex content (2-5min)
- Keep total timeout 2x generation timeout

## Understanding Configuration Hierarchy

Your configuration is built from multiple sources:
1. **User Configuration** (highest priority - your settings)
2. **Organization Configuration** (shared team settings)
3. **Environment Variables** (system defaults)
4. **Application Defaults** (fallback values)

The AI Configuration UI shows your **effective configuration** - the final merged result from all sources.

## Cost Optimization Tips

### Reduce Costs
1. Use Claude Haiku for simple tasks
2. Lower max tokens for shorter responses
3. Set conservative daily budgets
4. Monitor and adjust based on usage

### Maximize Value
1. Use appropriate model for task complexity
2. Optimize temperature for your needs
3. Use retry strategy to avoid failed generations
4. Batch generate to utilize concurrent requests

### Budget Monitoring
- Check budget summary regularly
- Respond to alert threshold notifications
- Review actual vs. estimated costs
- Adjust budgets based on needs

## Troubleshooting

### Configuration Not Saving
- Check for validation errors above tabs
- Ensure all required fields are filled
- Verify API connectivity
- Try refreshing the page

### High Costs
- Review selected model (Opus is most expensive)
- Check max tokens setting
- Monitor requests per minute
- Review daily budget usage

### Generation Timeouts
- Increase generation timeout
- Check network connectivity
- Reduce max tokens
- Try different model

### Rate Limit Errors
- Reduce requests per minute
- Lower concurrent requests
- Check Claude API status
- Increase retry base delay

## Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Arrow Keys**: Adjust slider values
- **Enter**: Save changes (when focused on input)
- **Escape**: Close history modal

## Accessibility

The AI Configuration interface is designed for accessibility:
- Full keyboard navigation support
- Screen reader compatible
- High contrast text
- Clear focus indicators
- Descriptive labels and help text

## Mobile Support

The interface is responsive and works on mobile devices:
- Vertical tab layout on small screens
- Touch-friendly controls
- Scrollable content
- Full functionality maintained

## Getting Help

### In-App Help
- Hover over information icons (ℹ️) for tooltips
- Read help text under each control
- Check validation error messages
- Review configuration preview

### Documentation
- Implementation Summary: `PROMPT-6-FILE-8-PART-3-IMPLEMENTATION-SUMMARY.md`
- Quick Reference: `PROMPT-6-FILE-8-PART-3-QUICK-REFERENCE.md`
- This User Guide: `PROMPT-6-FILE-8-PART-3-README.md`

### Support
- Contact your system administrator
- Check Claude API documentation
- Review application logs
- Submit bug reports through proper channels

## Security & Privacy

### Data Security
- API keys encrypted at rest
- Keys transmitted over HTTPS
- Session-based authentication
- User-scoped configurations

### Privacy
- Configuration changes logged with user ID
- Change history shows who made changes
- No sensitive data in logs
- Compliant with data protection policies

## Frequently Asked Questions

**Q: Can I have different configurations for different projects?**  
A: Currently, you have one configuration per user. Organization-level configurations can be set by administrators.

**Q: What happens if I exceed my budget?**  
A: Generation will be blocked until the next budget period or until you increase the limit.

**Q: How often should I rotate API keys?**  
A: Quarterly rotation is recommended for security without frequent disruption.

**Q: Can I copy configuration to another user?**  
A: Currently, configurations must be set individually. Export/import is a planned feature.

**Q: What if Claude API changes their models?**  
A: The application will be updated to reflect new models. Your configuration will use the closest equivalent.

## Version History

**Version 1.0.0** - November 1, 2025
- Initial release
- 5 configuration tabs
- Real-time validation
- Change history
- Cost estimation
- API key management

## Feedback

We welcome your feedback on the AI Configuration interface:
- Report bugs through the issue tracker
- Suggest improvements
- Share use cases
- Request features

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

For technical documentation, see `PROMPT-6-FILE-8-PART-3-IMPLEMENTATION-SUMMARY.md`

