/**
 * Timeline Game Utilities
 */

import type { TimelineEvent, PlacedEvent, EventCategory } from './types';

/**
 * Format event value for display
 */
export function formatEventValue(event: TimelineEvent, hideValue: boolean = false): string {
    if (hideValue) return '???';

    const { value, category, unit } = event;

    switch (category) {
        case 'time':
            return value.toString();

        case 'population':
            return value.toLocaleString();

        case 'area':
        case 'speed':
        case 'length':
        case 'weight':
        case 'temperature':
        case 'calories':
        case 'lifespan':
        case 'duration':
        case 'timezone':
            return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();

        default:
            return value.toString();
    }
}

/**
 * Get category icon/emoji
 */
export function getCategoryIcon(category: EventCategory): string {
    switch (category) {
        case 'time':
            return '📅';
        case 'population':
            return '👥';
        case 'area':
            return '🗺️';
        case 'speed':
            return '⚡';
        case 'length':
            return '📏';
        case 'duration':
            return '⏱️';
        case 'weight':
            return '⚖️';
        case 'temperature':
            return '🌡️';
        case 'calories':
            return '🍽️';
        case 'lifespan':
            return '💚';
        case 'timezone':
            return '🕐';
        default:
            return '❓';
    }
}

/**
 * Get category label
 */
export function getCategoryLabel(category: EventCategory): string {
    switch (category) {
        case 'time':
            return 'Year';
        case 'population':
            return 'Population';
        case 'area':
            return 'Area';
        case 'speed':
            return 'Speed';
        case 'length':
            return 'Height/Length';
        case 'duration':
            return 'Duration';
        case 'weight':
            return 'Weight';
        case 'temperature':
            return 'Temperature';
        case 'calories':
            return 'Calories';
        case 'lifespan':
            return 'Lifespan';
        case 'timezone':
            return 'Time Zone';
        default:
            return 'Unknown';
    }
}

/**
 * Sort placed events by value
 */
export function sortEvents(events: PlacedEvent[]): PlacedEvent[] {
    return [...events].sort((a, b) => a.value - b.value);
}
