import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HiOutlineSpeakerphone, HiOutlinePlus, HiOutlineMail, HiOutlineChat } from 'react-icons/hi';

const CampaignListPage = () => (
    <ModulePage title="Marketing" description="WhatsApp, Email & SMS campaigns" icon={HiOutlineSpeakerphone}>
        <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary dark:text-gray-400">Reach your customers with targeted campaigns</p>
            <Button icon={HiOutlinePlus}>Create Campaign</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { name: 'Summer Sale Promo', channel: 'WhatsApp', sent: 245, opens: 189, status: 'completed', icon: HiOutlineChat },
                { name: 'New Year Offers', channel: 'Email', sent: 412, opens: 287, status: 'completed', icon: HiOutlineMail },
                { name: 'Festive Discounts', channel: 'WhatsApp', sent: 0, opens: 0, status: 'draft', icon: HiOutlineChat },
            ].map((c, i) => (
                <Card key={i} hover padding="md">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <c.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary dark:text-white">{c.name}</p>
                                <p className="text-xs text-text-secondary dark:text-gray-400">{c.channel}</p>
                            </div>
                        </div>
                        <Badge color={c.status === 'completed' ? 'emerald' : 'gray'}>{c.status}</Badge>
                    </div>
                    {c.sent > 0 && (
                        <div className="flex gap-4 mt-3 text-xs text-text-secondary dark:text-gray-400">
                            <span>Sent: <strong className="text-text-primary dark:text-white">{c.sent}</strong></span>
                            <span>Opens: <strong className="text-text-primary dark:text-white">{c.opens}</strong></span>
                            <span>Rate: <strong className="text-emerald-500">{Math.round((c.opens / c.sent) * 100)}%</strong></span>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default CampaignListPage;
