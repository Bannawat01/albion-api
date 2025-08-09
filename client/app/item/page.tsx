import React from "react";



type Item = {
    id: number;
    name: string;
    description: string;
};

const items: Item[] = [
    { id: 1, name: "Item One", description: "Description for item one." },
    { id: 2, name: "Item Two", description: "Description for item two." },
    { id: 3, name: "Item Three", description: "Description for item three." },
    { id: 4, name: "Item Four", description: "Description for item four." },
];

const ItemList: React.FC = () => (
    <div>
        <h1>Item List</h1>
        <ul>
            {items.map((item) => (
                <li key={item.id}>
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                </li>
            ))}
        </ul>
    </div>
);

export default ItemList;