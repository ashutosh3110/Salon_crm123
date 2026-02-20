import BaseRepository from '../base.repository.js';
import Booking from './booking.model.js';

class BookingRepository extends BaseRepository {
    constructor() {
        super(Booking);
    }
}

export default new BookingRepository();
