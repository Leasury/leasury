/**
 * Timeline Game Event Dataset
 * Sample events for testing and gameplay
 */

import { TimelineEvent } from './types';

export const timelineEvents: TimelineEvent[] = [
    // Historical Events (Time category)
    {
        id: 'moon-landing',
        title: 'Moon Landing (Apollo 11)',
        category: 'time',
        value: 1969,
        description: 'First humans land on the Moon',
    },
    {
        id: 'eiffel-tower',
        title: 'Eiffel Tower Completed',
        category: 'time',
        value: 1889,
        description: 'Iconic Paris landmark finished',
    },
    {
        id: 'titanic',
        title: 'Titanic Sinks',
        category: 'time',
        value: 1912,
        description: 'RMS Titanic hits iceberg',
    },
    {
        id: 'berlin-wall-fall',
        title: 'Fall of Berlin Wall',
        category: 'time',
        value: 1989,
        description: 'End of Cold War symbol',
    },
    {
        id: 'ww2-end',
        title: 'World War II Ends',
        category: 'time',
        value: 1945,
        description: 'VJ Day - Japan surrenders',
    },
    {
        id: 'internet-invented',
        title: 'World Wide Web Invented',
        category: 'time',
        value: 1989,
        description: 'Tim Berners-Lee creates WWW',
    },
    {
        id: 'first-iphone',
        title: 'First iPhone Released',
        category: 'time',
        value: 2007,
        description: 'Apple revolutionizes smartphones',
    },
    {
        id: 'columbus-america',
        title: 'Columbus Reaches America',
        category: 'time',
        value: 1492,
        description: 'European discovery of Americas',
    },
    {
        id: 'french-revolution',
        title: 'French Revolution Begins',
        category: 'time',
        value: 1789,
        description: 'Storming of the Bastille',
    },
    {
        id: 'first-flight',
        title: 'Wright Brothers First Flight',
        category: 'time',
        value: 1903,
        description: 'First powered airplane flight',
    },

    // Population
    {
        id: 'prague-population',
        title: 'Population of Prague',
        category: 'population',
        value: 1_300_000,
        description: 'Capital of Czech Republic',
    },
    {
        id: 'london-population',
        title: 'Population of London',
        category: 'population',
        value: 9_000_000,
        description: 'UK capital city',
    },
    {
        id: 'tokyo-population',
        title: 'Population of Tokyo',
        category: 'population',
        value: 14_000_000,
        description: 'Japan capital (city proper)',
    },

    // Speed
    {
        id: 'cheetah-speed',
        title: 'Cheetah Top Speed',
        category: 'speed',
        value: 120,
        unit: 'km/h',
        description: 'Fastest land animal',
    },
    {
        id: 'usain-bolt',
        title: 'Usain Bolt Top Speed',
        category: 'speed',
        value: 44,
        unit: 'km/h',
        description: 'Fastest human ever',
    },
    {
        id: 'commercial-plane',
        title: 'Boeing 747 Cruise Speed',
        category: 'speed',
        value: 900,
        unit: 'km/h',
        description: 'Typical commercial jet',
    },

    // Length
    {
        id: 'eiffel-height',
        title: 'Eiffel Tower Height',
        category: 'length',
        value: 330,
        unit: 'm',
        description: 'Including antenna',
    },
    {
        id: 'burj-khalifa',
        title: 'Burj Khalifa Height',
        category: 'length',
        value: 828,
        unit: 'm',
        description: 'Tallest building in the world',
    },
    {
        id: 'statue-liberty',
        title: 'Statue of Liberty Height',
        category: 'length',
        value: 93,
        unit: 'm',
        description: 'Including pedestal',
    },

    // Temperature
    {
        id: 'water-boil',
        title: 'Water Boiling Point',
        category: 'temperature',
        value: 100,
        unit: '°C',
        description: 'At sea level',
    },
    {
        id: 'water-freeze',
        title: 'Water Freezing Point',
        category: 'temperature',
        value: 0,
        unit: '°C',
        description: 'At sea level',
    },
    {
        id: 'body-temp',
        title: 'Human Body Temperature',
        category: 'temperature',
        value: 37,
        unit: '°C',
        description: 'Normal average',
    },
];

/**
 * Get a random event not yet used
 */
export function getRandomEvent(usedIds: string[]): TimelineEvent | null {
    const available = timelineEvents.filter(e => !usedIds.includes(e.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get the starting event (always the same for consistency)
 */
export function getStartingEvent(): TimelineEvent {
    return timelineEvents.find(e => e.id === 'moon-landing') || timelineEvents[0];
}
