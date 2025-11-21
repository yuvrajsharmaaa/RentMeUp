/**
 * Type definitions for Campus Resources Dashboard
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 */

/**
 * Resource Status - Indicates availability of a campus resource
 */
export type ResourceStatus = 'available' | 'reserved';

/**
 * Resource Category - Classification of campus resources
 */
export type ResourceCategory = 'Lab' | 'Equipment' | 'Room' | 'Vehicle' | 'Other';

/**
 * Resource Interface - Represents a campus resource
 * 
 * @property id - Unique identifier for the resource
 * @property name - Display name of the resource
 * @property category - Type/category of the resource
 * @property status - Current availability status
 * @property description - Optional detailed description
 * @property location - Optional physical location
 */
export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  status: ResourceStatus;
  description?: string;
  location?: string;
}

/**
 * Navigation Item Interface - Represents a sidebar navigation link
 * 
 * @property label - Display text for the navigation item
 * @property href - Route path
 * @property icon - Optional icon name/component identifier
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
