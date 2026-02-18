import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LexicalEditor from './LexicalEditor'
import AutoSaveIndicator from './AutoSaveIndicator'
import useEditorStore from '../../store/editorStore'
import usePostsStore from '../../store/postsStore'

export default function EditorPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [isPublishing, setIsPublishing] = useState(false)

    const { currentPost, setCurrentPost, resetEditor } = useEditorStore()
    const { createPost, publishPost, posts } = usePostsStore()

    useEffect(() => {
        const initializeEditor = async () => {
            if (id) {
                // Load existing post
                const post = posts.find((p) => p._id === id)
                if (post) {
                    setCurrentPost(post)
                    setTitle(post.title || '')
                }
            } else {
                // Create new post
                try {
                    const newPost = await createPost({
                        title: 'Untitled',
                        content: null,
                        status: 'draft',
                    })
                    setCurrentPost(newPost)
                    setTitle(newPost.title)
                    // Update URL with new post ID
                    navigate(`/editor/${newPost._id}`, { replace: true })
                } catch (error) {
                    console.error('Failed to create post:', error)
                }
            }
        }

        initializeEditor()

        // Cleanup on unmount
        return () => {
            resetEditor()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const handleTitleChange = (e) => {
        setTitle(e.target.value)
        // TODO: Debounce title updates
    }

    const handlePublish = async () => {
        if (!currentPost?._id) return

        setIsPublishing(true)
        try {
            await publishPost(currentPost._id)
            alert('Post published successfully!')
            navigate('/')
        } catch (error) {
            console.error('Failed to publish:', error)
            alert('Failed to publish post')
        } finally {
            setIsPublishing(false)
        }
    }

    const handleBack = () => {
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-white">
            <AutoSaveIndicator />

            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                >
                    ← Back to Posts
                </button>

                <div className="flex items-center gap-3">
                    {currentPost?.status === 'draft' && (
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="btn btn-primary"
                        >
                            {isPublishing ? 'Publishing...' : 'Publish'}
                        </button>
                    )}
                </div>
            </div>

            {/* Title Input */}
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Post title..."
                    className="w-full text-5xl font-bold outline-none border-none focus:ring-0 placeholder-gray-300"
                />
            </div>

            {/* Editor */}
            <LexicalEditor />
        </div>
    )
}
