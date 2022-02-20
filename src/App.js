import React, { useState, useEffect } from 'react';
import '@aws-amplify/ui-react/styles.css';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { API, Storage } from 'aws-amplify';
import { listPosts } from './graphql/queries';
import { createPost as createPostMutation, deletePost as deletePostMutation } from './graphql/mutations';
import './App.css';

const initialFormState = { title: '', excerpt: '', contents: '', image: '' };

function App() {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const apiData = await API.graphql({ query: listPosts });
    const postsFromAPI = apiData.data.listPosts.items;
    await Promise.all(postsFromAPI.map(async post => {
      if (post.image) {
        const image = await Storage.get(post.image);
        post.image = image;
      }
      return post;
    }))
    setPosts(apiData.data.listPosts.items);
  }

  async function createPost() {
    if (!formData.title || !formData.excerpt) return;
    await API.graphql({ query: createPostMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setPosts([ ...posts, formData ]);
    setFormData(initialFormState);
  }

  async function deletePost({ id }) {
    const newPostsArray = posts.filter(post => post.id !== id);
    setPosts(newPostsArray);
    await API.graphql({ query: deletePostMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchPosts();
  }

  return (
    <div className="App">
      <h1>React Posts App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'title': e.target.value})}
        placeholder="Post title"
        value={formData.title}
      />
      <input
        onChange={e => setFormData({ ...formData, 'excerpt': e.target.value})}
        placeholder="Post excerpt"
        value={formData.excerpt}
      />
      <textarea
        onChange={e => setFormData({ ...formData, 'contents': e.target.value })}
        placeholder="Post contents"
        value={formData.contents}
      />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createPost}>Create Post</button>
      <div style={{marginBottom: 30}}>
        {
          posts.map(post => (
            <div key={post.id || post.name}>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <div>
                {post.contents}
              </div>
              {post.image && (
                <img src={post.image} style={{ width: 400 }} />
              )}
              <button onClick={() => deletePost(post)}>Delete Post</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default withAuthenticator(App);
