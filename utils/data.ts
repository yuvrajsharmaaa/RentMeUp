/**
 * Placeholder data for Campus Resources
 * 
 * This file contains sample/mock data used for initial development and testing.
 * In production, this would be replaced with API calls to fetch real data.
 */

import { Resource } from '@/types';

/**
 * Sample campus resources for initial render
 * Each resource represents a bookable campus asset
 */
export const SAMPLE_RESOURCES: Resource[] = [
  {
    id: '1',
    name: 'Computer Lab A',
    category: 'Lab',
    status: 'available',
    description: 'Main computer lab with 30 workstations',
    location: 'Building A, Floor 2'
  },
  {
    id: '2',
    name: '3D Printer',
    category: 'Equipment',
    status: 'reserved',
    description: 'Industrial-grade 3D printer for prototyping',
    location: 'Maker Space, Building B'
  },
  {
    id: '3',
    name: 'Conference Room 101',
    category: 'Room',
    status: 'available',
    description: 'Meeting room with video conferencing, seats 20',
    location: 'Administration Building, Floor 1'
  },
  {
    id: '4',
    name: 'VR Lab',
    category: 'Lab',
    status: 'available',
    description: 'Virtual Reality lab with 10 VR headsets',
    location: 'Building C, Floor 3'
  },
  {
    id: '5',
    name: 'Campus Van',
    category: 'Vehicle',
    status: 'reserved',
    description: '12-passenger van for campus trips',
    location: 'Parking Lot B'
  },
  {
    id: '6',
    name: 'Recording Studio',
    category: 'Room',
    status: 'available',
    description: 'Professional audio recording studio',
    location: 'Arts Building, Basement'
  },
  {
    id: '7',
    name: 'Drone Equipment',
    category: 'Equipment',
    status: 'available',
    description: 'DJI Phantom 4 Pro drone with accessories',
    location: 'Media Lab, Building D'
  },
  {
    id: '8',
    name: 'Chemistry Lab',
    category: 'Lab',
    status: 'reserved',
    description: 'Advanced chemistry laboratory',
    location: 'Science Building, Floor 2'
  }
];
