import Blog from './blog.model.js';

class BlogService {
    async createBlog(blogBody) {
        if (!blogBody.slug || blogBody.slug.trim() === '') {
            blogBody.slug = blogBody.title
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');
        }
        
        // Ensure slug is not empty if title is non-alphanumeric
        if (!blogBody.slug) blogBody.slug = 'post';

        // Check for existing slug and add numeric suffix if needed
        let slug = blogBody.slug;
        let count = 1;
        while (await Blog.findOne({ slug })) {
            slug = `${blogBody.slug}-${count}`;
            count++;
        }
        blogBody.slug = slug;
        
        return Blog.create(blogBody);
    }

    async getBlogs(query = {}) {
        const { category, status, search, isFeatured } = query;
        const filter = {};

        if (category) filter.category = category;
        if (status) filter.status = status;
        if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
            ];
        }

        return Blog.find(filter).sort({ createdAt: -1 });
    }

    async getBlogBySlug(slug) {
        const blog = await Blog.findOne({ slug });
        if (blog) {
            blog.reads += 1;
            await blog.save();
        }
        return blog;
    }

    async getBlogById(id) {
        return Blog.findById(id);
    }

    async updateBlogById(id, updateBody) {
        const blog = await this.getBlogById(id);
        if (!blog) throw new Error('Blog not found');
        
        if (updateBody.title && !updateBody.slug) {
            updateBody.slug = updateBody.title
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');
        }

        Object.assign(blog, updateBody);
        await blog.save();
        return blog;
    }

    async deleteBlogById(id) {
        const blog = await this.getBlogById(id);
        if (!blog) throw new Error('Blog not found');
        return Blog.findByIdAndDelete(id);
    }
}

export default new BlogService();
