import userRepository from './user.repository.js';

class UserService {
    async createUser(userBody) {
        if (await userRepository.findByEmail(userBody.email)) {
            throw new Error('Email already taken');
        }
        return userRepository.create(userBody);
    }

    async getUserById(id) {
        return userRepository.findOne({ _id: id });
    }

    async getUserByEmail(email) {
        return userRepository.findByEmail(email);
    }

    async queryUsers(filter, options) {
        return userRepository.find(filter, options);
    }

    async updateUserById(id, updateBody) {
        const user = await this.getUserById(id);
        if (!user) throw new Error('User not found');
        Object.assign(user, updateBody);
        await user.save();
        return user;
    }
}

export default new UserService();
