import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { Button, Icon, Confirm, Popup } from 'semantic-ui-react';

import { FETCH_POSTS_QUERY } from '../util/graphql';

export default function DeleteButton({ postId, commentId, callback }) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;
	const [deletePost] = useMutation(mutation, {
		update(proxy, result) {
			setConfirmOpen(false);
			if (!commentId) {
				const data = proxy.readQuery({
					query: FETCH_POSTS_QUERY,
				});
				proxy.writeQuery({
					query: FETCH_POSTS_QUERY,
					data: {
						getPosts: data.getPosts.filter((post) => post.id !== postId),
					},
				});
			}

			if (callback) callback();
		},
		variables: {
			postId,
			commentId,
		},
	});
	return (
		<>
			<Popup
				content='Delete'
				inverted
				trigger={
					<Button
						as='div'
						color='red'
						onClick={() => setConfirmOpen(true)}
						floated='right'
					>
						<Icon name='trash' style={{ margin: 0 }} />
					</Button>
				}
			/>
			<Confirm
				open={confirmOpen}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={deletePost}
			/>
		</>
	);
}

const DELETE_POST_MUTATION = gql`
	mutation deletePost($postId: ID!) {
		deletePost(postId: $postId)
	}
`;

const DELETE_COMMENT_MUTATION = gql`
	mutation deleteComment($postId: ID!, $commentId: ID!) {
		deleteComment(postId: $postId, commentId: $commentId) {
			id
			comments {
				id
				username
				createdAt
				body
			}
			commentCount
		}
	}
`;
