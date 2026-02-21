export default class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return this.model.create(data);
    }

    async findOne(filter) {
        return this.model.findOne(filter);
    }

    async find(filter, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 }, populate } = options;
        const skip = (page - 1) * limit;

        let query = this.model.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        if (populate) {
            if (Array.isArray(populate)) {
                populate.forEach((path) => {
                    query = query.populate(path);
                });
            } else {
                query = query.populate(populate);
            }
        }

        const results = await query;

        const totalResults = await this.model.countDocuments(filter);
        const totalPages = Math.ceil(totalResults / limit);

        return {
            results,
            page,
            limit,
            totalPages,
            totalResults,
        };
    }

    async updateOne(filter, update) {
        return this.model.findOneAndUpdate(filter, update, { new: true });
    }

    async deleteOne(filter) {
        return this.model.findOneAndDelete(filter);
    }
}
