import React from "react"
import ItemSearch from "../../components/ItemSearch"

export default function ItemPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Albion Online Items</h1>
                <p className="text-gray-600">ค้นหาและดูข้อมูลไอเทมในเกม Albion Online</p>
            </div>

            <ItemSearch />
        </div>
    )
}