export type TiltColor = 'Red' | 'Green' | 'Black' | 'Purple' | 'Orange' | 'Blue' | 'Yellow' | 'Pink';

export interface Batch {
    id?: string;
    name: string;
    startDate: string;
    status: 'primary' | 'secondary' | 'tertiary' | 'conditioning' | 'aging' | 'complete';
    targetAbv: number;
    originalGravity: number;
    currentGravity: number;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string;
    currentAbv?: number;
    tiltColor?: TiltColor;
    tiltHourlyThreshold?: number;
}

export interface BatchNote {
    id?: string;
    batchId: string;
    note: string;
    createdAt: string;
}

export interface Feeding {
    id?: string;
    batchId: string;
    feedingNumber: number;
    preGravity: number;
    postGravity: number;
    date: string;
    ingredients: string;
    notes?: string;
}

export interface GravityReading {
    id?: string;
    batchId: string;
    feedingNumber: number;
    reading: number;
    date: string;
    notes?: string;
}

export interface Ingredient {
    id?: string;
    batchId: string;
    name: string;
    amount: number;
    unit: 'lbs' | 'oz' | 'g' | 'kg' | 'gallons' | 'ml' | 'L';
    type: 'honey' | 'fruit' | 'spice' | 'nutrient' | 'yeast' | 'water' | 'other';
    notes?: string;
    addedDate: Date;
}

export interface Alert {
    id?: string;
    batchId: string;
    title: string;
    dueDate?: Date;
    gravityThreshold?: number;
    completed: boolean;
    notified: boolean;
    createdAt: Date;
}