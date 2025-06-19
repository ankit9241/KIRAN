# Study Material System

## Overview
The study material system allows admins and mentors to organize and share educational resources with students in a structured, subject-based manner.

## Features

### For Admins and Mentors:
1. **Create Folders**: Organize materials by subjects and topics
2. **Upload Materials**: Add various file types (PDF, documents, videos, etc.)
3. **Manage Content**: Edit and delete materials as needed
4. **Subject Organization**: Categorize materials by academic subjects

### For Students:
1. **Browse by Subject**: View all available subjects
2. **Access Folders**: Navigate through organized folder structures
3. **Download Materials**: Download study resources for offline use
4. **View Details**: See material descriptions and upload information

## File Structure

### Backend Routes (`/api/study-material/`)
- `GET /subjects` - Get all available subjects
- `GET /subjects/:subject/folders` - Get folders for a specific subject
- `GET /subjects/:subject/materials` - Get materials for a specific subject
- `GET /folders/:folderId/materials` - Get materials in a specific folder
- `POST /folders` - Create a new folder (admin/mentor only)
- `POST /upload` - Upload study material (admin/mentor only)
- `GET /download/:id` - Download a study material
- `DELETE /:id` - Delete a study material (admin/mentor only)

### Database Schema
The StudyMaterial model includes:
- `title`: Material or folder name
- `description`: Detailed description
- `type`: 'folder', 'pdf', 'video', 'notes', 'document', etc.
- `subject`: Academic subject categorization
- `folder`: Reference to parent folder (optional)
- `filePath`: Path to uploaded file
- `originalName`: Original filename
- `uploadedBy`: User who uploaded the material
- `isPublic`: Whether the material is publicly accessible

## Usage

### Creating a Folder
1. Navigate to Study Materials page
2. Click "Create New Folder" (admin/mentor only)
3. Enter folder name, subject, and description
4. Submit to create the folder

### Uploading Materials
1. Click "Add Study Material" (admin/mentor only)
2. Fill in material details (title, type, subject, description)
3. Optionally select a folder to organize the material
4. Upload the file
5. Submit to add the material

### Accessing Materials (Students)
1. Select a subject from the left sidebar
2. Browse available folders and materials
3. Click download button to save materials locally

## File Types Supported
- PDF documents
- Word documents (.doc, .docx)
- Text files (.txt)
- Images (.jpg, .jpeg, .png, .gif)
- Videos (.mp4)
- Audio files (.mp3)

## Security
- Only authenticated users can access materials
- Only admins and mentors can create/edit/delete content
- Students can only view and download public materials
- File uploads are validated for type and size (10MB limit)

## Technical Notes
- Files are stored in `backend/uploads/resources/`
- File names are automatically generated to prevent conflicts
- Materials are organized by subject for easy navigation
- The system supports both folder-based and flat organization 