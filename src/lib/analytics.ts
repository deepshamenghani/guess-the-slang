import posthog from 'posthog-js';

export function initAnalytics() {
  posthog.init('phc_1mSIxVhKxpFGEyZpfNYEQYLi2x9UI4MkgRkMnl3jQlF', {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}
