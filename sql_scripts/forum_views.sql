USE Forum;

CREATE OR REPLACE VIEW NewPostsToAll AS
	SELECT 
		P.pid AS post_id, 
        P.date_posted, 
        U.uid AS user_id, 
        U.uname AS username, 
        P.title, 
        P.link,
        GROUP_CONCAT(T.tag SEPARATOR ' ') AS post_tags
	FROM Posts P 
    JOIN Users U ON P.uid = U.uid
    LEFT JOIN PostTags T ON P.pid = T.pid
    GROUP BY P.pid
    ORDER BY P.date_posted DESC;

CREATE OR REPLACE VIEW PostDetails AS
	SELECT 
		P.pid AS post_id, 
        P.date_posted, 
        U.uid AS user_id, 
        U.uname AS username, 
        P.title, 
        P.link,
        P.content AS post_body,
        GROUP_CONCAT(T.tag SEPARATOR ' ') AS post_tags
	FROM Posts P 
    JOIN Users U ON P.uid = U.uid
    LEFT JOIN PostTags T ON P.pid = T.pid
    GROUP BY P.pid;

CREATE OR REPLACE VIEW RootComments AS
	SELECT 	
		C.cid AS comment_id,
        C.pid AS post_id
	FROM Comments C
		JOIN CommentTree T ON C.cid = T.parent_id
        JOIN Users U ON C.uid = U.uid
	WHERE NOT EXISTS (
			SELECT 
				*
			FROM CommentTree CT
            WHERE CT.child_id = C.cid
				AND CT.parent_id <> C.cid)
	GROUP BY C.cid
    ORDER BY C.date_commented;

CREATE OR REPLACE VIEW NewPostsToGroup AS
	SELECT 
		G.gname AS group_name, 
		N.*
	FROM NewPostsToAll N 
		JOIN GroupCurators GC ON N.user_id = GC.uid
		JOIN Groups G ON GC.gid = G.gid
    WHERE GC.tag = 'all' 
		OR EXISTS (
			SELECT 
				* 
			FROM PostTags PTs
			WHERE PTs.pid = N.post_id 
				AND PTs.tag = GC.tag)
	GROUP BY N.post_id
    ORDER BY N.date_posted;

CREATE OR REPLACE VIEW NewGroupMessages AS
    SELECT 
        G.gname AS groupname,
        U.uname AS username,
        M.mid AS message_id, 
        M.msg_date AS date_messaged, 
        M.msg AS message_body
    FROM GroupMessages M
		JOIN Groups G ON G.gid = M.gid
        JOIN Users U ON M.uid = U.uid
    ORDER BY M.msg_date DESC;