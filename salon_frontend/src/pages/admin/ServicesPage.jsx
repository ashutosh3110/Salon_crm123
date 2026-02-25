import React from 'react';
import {
    ChevronRight,
} from 'lucide-react';
import ServiceList from '../../components/admin/services/ServiceList';
import ServiceForm from '../../components/admin/services/ServiceForm';
import ServiceCategories from '../../components/admin/services/ServiceCategories';
import ServiceSettings from '../../components/admin/services/ServiceSettings';
import { useBusiness } from '../../contexts/BusinessContext';

export default function ServicesPage({ tab = 'list' }) {
    const activeTab = tab;
    const {
        services,
        categories,
        addService,
        updateService,
        deleteService,
        toggleServiceStatus,
        addCategory,
        deleteCategory,
        toggleCategoryStatus
    } = useBusiness();

    return (
        <div className="space-y-6 animate-reveal">
            {/* Context Navigation - Breadcrumb style */}
            <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                <span className="opacity-60">Operations</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                <span className="text-primary">Service Meta</span>
            </div>

            {/* Content Area */}
            <div className="min-h-[700px]">
                {activeTab === 'list' && (
                    <ServiceList
                        services={services}
                        onDelete={deleteService}
                        onToggleStatus={toggleServiceStatus}
                    />
                )}
                {activeTab === 'add-service' && (
                    <ServiceForm
                        onSave={addService}
                        categories={categories.map(c => c.name)}
                    />
                )}
                {activeTab === 'edit-service' && (
                    <ServiceForm
                        onSave={(data) => updateService(data.id, data)}
                        categories={categories.map(c => c.name)}
                        initialData={services.find(s => s.id === parseInt(window.location.pathname.split('/').pop()))}
                    />
                )}
                {activeTab === 'categories' && (
                    <ServiceCategories
                        categories={categories.map(cat => ({
                            ...cat,
                            serviceCount: services.filter(s => s.category === cat.name).length
                        }))}
                        onAdd={addCategory}
                        onDelete={deleteCategory}
                        onToggleStatus={toggleCategoryStatus}
                    />
                )}
                {activeTab === 'settings' && <ServiceSettings />}
            </div>
        </div>
    );
}
