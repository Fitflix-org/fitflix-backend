# Blog Publishing API Documentation

This document describes the new blog publishing endpoints that allow you to publish, save as draft, and schedule blog posts.

## New Endpoints

### 1. Publish Blog
**PATCH** `/api/blogs/:id/publish`

Publishes a blog post immediately, changing its status to `PUBLISHED`.

**Response:**
```json
{
  "success": true,
  "message": "Blog published successfully",
  "blog": {
    "id": "uuid",
    "title": "Blog Title",
    "status": "PUBLISHED",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Save as Draft
**PATCH** `/api/blogs/:id/draft`

Saves a blog post as a draft, changing its status to `DRAFT`.

**Response:**
```json
{
  "success": true,
  "message": "Blog saved as draft successfully",
  "blog": {
    "id": "uuid",
    "title": "Blog Title",
    "status": "DRAFT",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Schedule Publishing
**PATCH** `/api/blogs/:id/schedule`

Schedules a blog post for future publishing. The blog status will be set to `SCHEDULED`.

**Request Body:**
```json
{
  "scheduledPublishAt": "2024-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog scheduled for publishing successfully",
  "blog": {
    "id": "uuid",
    "title": "Blog Title",
    "status": "SCHEDULED",
    "scheduledPublishAt": "2024-12-31T23:59:59.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation:**
- `scheduledPublishAt` is required
- Date must be in valid ISO format
- Date must be in the future

### 4. Unschedule Publishing
**PATCH** `/api/blogs/:id/unschedule`

Removes the scheduled publishing for a blog post, reverting it back to `DRAFT` status.

**Response:**
```json
{
  "success": true,
  "message": "Blog publishing unscheduled successfully",
  "blog": {
    "id": "uuid",
    "title": "Blog Title",
    "status": "DRAFT",
    "scheduledPublishAt": null,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Blog Statuses

The blog system now supports the following statuses:

- **DRAFT**: Blog is saved but not published
- **PUBLISHED**: Blog is live and visible to users
- **SCHEDULED**: Blog is scheduled for future publishing
- **ARCHIVED**: Blog is archived (existing functionality)

## Usage Examples

### Publish a blog immediately:
```bash
curl -X PATCH http://localhost:3000/api/blogs/blog-uuid/publish
```

### Save a blog as draft:
```bash
curl -X PATCH http://localhost:3000/api/blogs/blog-uuid/draft
```

### Schedule a blog for publishing:
```bash
curl -X PATCH http://localhost:3000/api/blogs/blog-uuid/schedule \
  -H "Content-Type: application/json" \
  -d '{"scheduledPublishAt": "2024-12-31T23:59:59.000Z"}'
```

### Unschedule a blog:
```bash
curl -X PATCH http://localhost:3000/api/blogs/blog-uuid/unschedule
```

## Database Changes

The following fields have been added to the Blog model:
- `scheduledPublishAt`: DateTime field for scheduled publishing (nullable)

The BlogStatus enum now includes:
- `SCHEDULED`: New status for scheduled blogs

## Next Steps

To implement automatic publishing of scheduled blogs, you'll need to:

1. Create a cron job or scheduled task that runs periodically
2. Check for blogs with `SCHEDULED` status where `scheduledPublishAt` <= current time
3. Update their status to `PUBLISHED`
4. Clear the `scheduledPublishAt` field

Example cron job logic:
```javascript
// Check every minute for blogs to publish
setInterval(async () => {
  const blogsToPublish = await prisma.blog.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledPublishAt: {
        lte: new Date()
      }
    }
  });

  for (const blog of blogsToPublish) {
    await prisma.blog.update({
      where: { id: blog.id },
      data: {
        status: 'PUBLISHED',
        scheduledPublishAt: null
      }
    });
  }
}, 60000);
```
