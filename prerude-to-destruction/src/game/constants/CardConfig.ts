import { StatusWindow } from '../../objects/StatusWindow';

export type CardType = 'earth' | 'recovery' | 'pollution' | 'interference' | 'regreen' | 'biosphere' | 'protect' | 'poaching';

export interface CardData {
    id: string;
    name: string;
    type: CardType;
    value: number;
    description: string;
    userPlayable?: (userStatus: StatusWindow) => boolean;
    targetPlayable?: (targetStatus: StatusWindow) => boolean;
}

export const CARD_LIST: CardData[] = [
    // 環境回復レベルカード
    { 
        id: 'recovery-5', 
        name: '環境回復レベル5', 
        type: 'recovery', 
        value: 5, 
        description: '環境レベル5回復', 
        userPlayable: (userStatus) => !userStatus.waste && !userStatus.oceanPollution && !userStatus.deforestation 
    },
    { 
        id: 'recovery-10', 
        name: '環境回復レベル10', 
        type: 'recovery', 
        value: 10, 
        description: '環境レベル10回復', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation 
    },
    { 
        id: 'recovery-15', 
        name: '環境回復レベル15', 
        type: 'recovery', 
        value: 15, 
        description: '環境レベル15回復', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation 
    },
    { 
        id: 'recovery-20', 
        name: '環境回復レベル20', 
        type: 'recovery', 
        value: 20, 
        description: '環境レベル20回復', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation 
    },

    // 公害カード
    { 
        id: 'pollution-10', 
        name: '公害レベル10', 
        type: 'pollution', 
        value: 10, 
        description: '環境破壊レベル10増加', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation 
    },
    { 
        id: 'pollution-15', 
        name: '公害レベル15', 
        type: 'pollution', 
        value: 15, 
        description: '環境破壊レベル15増加', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation 
    },

    // 妨害カード
    {
        id: 'waste', 
        name: '廃棄物', 
        type: 'interference', 
        value: 0, 
        description: '行動不能', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation,
        targetPlayable: (targetstatus) => !targetstatus.waste
    }, 
    {
        id: 'ocean-pollution', 
        name: '海洋汚染', 
        type: 'interference', 
        value: 0, 
        description: '行動不能', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation,
        targetPlayable: (targetstatus) => !targetstatus.oceanPollution
    },
    {
        id: 'deforestation', 
        name: '森林伐採', 
        type: 'interference', 
        value: 0, 
        description: '行動不能', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation,
        targetPlayable: (targetstatus) => !targetstatus.deforestation
    },

    // 修復カード
    {
        id: 'waste-treatment', 
        name: '廃棄物処理工場', 
        type: 'regreen', 
        value: 0, 
        description: '廃棄物無効化', 
        targetPlayable: (targetstatus) => targetstatus.waste
    },
    {
        id: 'waste-water-treatment', 
        name: '汚水処理', 
        type: 'regreen', 
        value: 0, 
        description: '海洋汚染無効化', 
        targetPlayable: (targetstatus) => targetstatus.oceanPollution
    },
    {
        id: 'planting', 
        name: '植樹', 
        type: 'regreen', 
        value: 0, 
        description: '森林伐採無効化', 
        targetPlayable: (targetstatus) => targetstatus.deforestation
    },
    {
        id: 'biosphere', 
        name: 'バイオスフェア', 
        type: 'biosphere', 
        value: 0, 
        description: '全て無効化', 
        targetPlayable: (targetstatus) => targetstatus.waste || targetstatus.oceanPollution || targetstatus.deforestation || targetstatus.pollution10 !== 0 || targetstatus.pollution15 !== 0
    },

    // 動物保護
    {
        id: 'animal-protection', 
        name: '動物保護', 
        type: 'protect', 
        value: 0, 
        description: '勝利条件', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation && !userstatus.animalProtection,
        targetPlayable: (targetstatus) => targetstatus.getData('HP') !== 0
    },

    // 密猟
    {
        id: 'poaching', 
        name: '密猟', 
        type: 'poaching', 
        value: 0, 
        description: '動物保護キャンセル', 
        userPlayable: (userstatus) => !userstatus.waste && !userstatus.oceanPollution && !userstatus.deforestation,
        targetPlayable: (targetstatus) => targetstatus.animalProtection
    },

];

export const EARTH_CARDS: CardData[] = [
     // 環境破壊レベルカード
     { id: 'earth-60', name: '環境破壊レベル60', type: 'earth', value: 60, description: '環境破壊レベルの初期値 60' },
     { id: 'earth-65', name: '環境破壊レベル65', type: 'earth', value: 65, description: '環境破壊レベルの初期値 65' },
     { id: 'earth-70', name: '環境破壊レベル70', type: 'earth', value: 70, description: '環境破壊レベルの初期値 70' },
     { id: 'earth-75', name: '環境破壊レベル75', type: 'earth', value: 75, description: '環境破壊レベルの初期値 75' },
     { id: 'earth-80', name: '環境破壊レベル80', type: 'earth', value: 80, description: '環境破壊レベルの初期値 80' },
     { id: 'earth-85', name: '環境破壊レベル85', type: 'earth', value: 85, description: '環境破壊レベルの初期値 85' }
];

export const DECK_CARDS = [
    {id: 'recovery-5', count: 10},
    {id: 'recovery-10', count: 16},
    {id: 'recovery-15', count: 14},
    {id: 'recovery-20', count: 6},
    {id: 'pollution-10', count: 5},
    {id: 'pollution-15', count: 5},
    {id: 'waste', count: 3},
    {id: 'ocean-pollution', count: 3},
    {id: 'deforestation', count: 3},
    {id: 'poaching', count: 3},
    {id: 'waste-treatment', count: 5},
    {id: 'waste-water-treatment', count: 5},
    {id: 'planting', count: 5},
    {id: 'biosphere', count: 2},
    {id: 'animal-protection', count: 7}
]