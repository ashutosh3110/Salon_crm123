import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { HiOutlineCog, HiOutlineSave } from 'react-icons/hi';
import Input from '../../../components/ui/Input';

const GeneralSettingsPage = () => (
    <ModulePage title="Settings" description="Configure your salon preferences" icon={HiOutlineCog}>
        <div className="max-w-2xl space-y-6">
            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Salon Information</h3>
                <div className="space-y-4">
                    <Input label="Salon Name" placeholder="My Salon" defaultValue="" />
                    <Input label="Business Email" type="email" placeholder="contact@salon.com" />
                    <Input label="Phone" type="tel" placeholder="+91 98765 43210" />
                    <Input label="Address" placeholder="123, Street Name, City" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Currency" placeholder="INR" defaultValue="INR" />
                        <Input label="Timezone" placeholder="Asia/Kolkata" defaultValue="Asia/Kolkata" />
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Tax Configuration</h3>
                <div className="space-y-4">
                    <Input label="GST Number" placeholder="22AAAAA0000A1Z5" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="CGST (%)" type="number" placeholder="9" />
                        <Input label="SGST (%)" type="number" placeholder="9" />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button icon={HiOutlineSave} size="lg">Save Settings</Button>
            </div>
        </div>
    </ModulePage>
);

export default GeneralSettingsPage;
