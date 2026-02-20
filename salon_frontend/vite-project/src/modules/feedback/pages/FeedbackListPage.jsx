import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HiOutlineChatAlt2, HiOutlineStar } from 'react-icons/hi';

const FeedbackListPage = () => (
    <ModulePage title="Feedback" description="Customer reviews and ratings" icon={HiOutlineChatAlt2}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            <Card className="text-center">
                <p className="text-3xl font-bold text-primary">4.6</p>
                <div className="flex justify-center gap-0.5 my-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <HiOutlineStar key={s} className={`w-5 h-5 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                </div>
                <p className="text-sm text-text-secondary dark:text-gray-400">Average Rating</p>
            </Card>
            <Card className="text-center">
                <p className="text-3xl font-bold text-text-primary dark:text-white">248</p>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">Total Reviews</p>
            </Card>
            <Card className="text-center">
                <p className="text-3xl font-bold text-emerald-500">92%</p>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">Satisfaction Rate</p>
            </Card>
        </div>

        <h3 className="text-lg font-semibold text-text-primary dark:text-white">Recent Feedback</h3>
        <div className="space-y-3">
            {[
                { client: 'Priya S.', rating: 5, comment: 'Amazing hair color! Riya did a fantastic job.', service: 'Hair Color', date: '2 hours ago' },
                { client: 'Amit K.', rating: 4, comment: 'Good beard trim, but had to wait 15 minutes.', service: 'Beard Trim', date: '5 hours ago' },
                { client: 'Sneha G.', rating: 5, comment: 'Best facial I\'ve ever had! Will definitely come again.', service: 'Facial', date: '1 day ago' },
            ].map((fb, i) => (
                <Card key={i} padding="md">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-text-primary dark:text-white">{fb.client}</p>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <HiOutlineStar key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-text-primary dark:text-gray-300 mt-1">{fb.comment}</p>
                            <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">{fb.service} • {fb.date}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </ModulePage>
);

export default FeedbackListPage;
