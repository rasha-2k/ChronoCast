import { Umbrella, Shield, Glasses, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
    Boot,
    FanBold,
    WaterBottle,
    RunningShoes,
    WinterHat,
    BilledCap,
    Poncho,
    ShieldSunOutline,
    SunglassesFill,
    SleevelessJacket,
    Camera,
    TShirtBold,
    CoatLine,
    MonclerJacket,
    TwotoneMasks,
    Gloves,
    Scarf,
    Raincoat,
    Jacket
} from "./custom";

type IconComponent = LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;

const ITEM_ICON_MAP: Record<string, IconComponent> = {
    // Categories
    'weather gear': Umbrella,
    'weather-gear': Umbrella,
    'protective items': Shield,
    'protective-items': Shield,
    'comfort accessories': FanBold,
    'comfort-accessories': FanBold,
    'safety equipment': Gloves,
    'safety-equipment': Gloves,

    'winter hat': WinterHat,
    'cap': BilledCap,
    'hat': BilledCap,
    'umbrella': Umbrella,
    'sunglasses': SunglassesFill,
    'eyewear': SunglassesFill,
    'glasses': Glasses,
    'water bottle': WaterBottle,
    'extra water': WaterBottle,
    'bottle': WaterBottle,
    'waterproof shoes': Boot,
    'water-proof shoes': Boot,
    'rain boots': Boot,
    'boots': Boot,
    'running shoes': RunningShoes,
    'sneakers': RunningShoes,
    'shoes': RunningShoes,
    'footwear': RunningShoes,
    'fan': FanBold,
    'light jacket': SleevelessJacket,
    'sleeveless jacket': SleevelessJacket,
    'vest': SleevelessJacket,
    'jacket': Jacket,
    'coat': Jacket,
    'windbreaker': Jacket,
    'warm coat': CoatLine,
    'heavy coat': CoatLine,
    'parka': CoatLine,
    'thermal': MonclerJacket,
    'thermale': MonclerJacket,
    'thermal clothing': MonclerJacket,
    'poncho': Poncho,
    'raincoat': Raincoat,
    't-shirt': TShirtBold,
    'light clothing': TShirtBold,
    'mask': TwotoneMasks,
    'scarf': Scarf,
    'gloves': Gloves,
    'sunscreen': ShieldSunOutline,
    'sunblock': ShieldSunOutline,
    'spf': ShieldSunOutline,
    'camera': Camera,
};

export const getItemIcon = (item: string): IconComponent => {
    const itemLower = item.toLowerCase();

    // Check for exact matches first
    if (ITEM_ICON_MAP[itemLower]) {
        return ITEM_ICON_MAP[itemLower];
    }

    // Check for partial matches
    for (const [key, icon] of Object.entries(ITEM_ICON_MAP)) {
        if (itemLower.includes(key)) {
            return icon;
        }
    }

    // Default icon
    return Package;
};