exports.createQueue=async(req,res)=>{

const {
organization_id,
queue_name,
capacity
}=req.body;

const result=await pool.query(
`
INSERT INTO queues
(organization_id,queue_name,capacity)
VALUES($1,$2,$3)
RETURNING *
`,
[organization_id,queue_name,capacity]
);

res.json(result.rows[0]);
};

exports.generateToken=async(req,res)=>{

const {
queue_id,
customer_name
}=req.body;

const count=await pool.query(
`
SELECT COUNT(*) FROM tokens
WHERE queue_id=$1
`,
[queue_id]
);

const tokenNo=
parseInt(count.rows[0].count)+1;

const token=await pool.query(
`
INSERT INTO tokens
(queue_id,customer_name,token_number)
VALUES($1,$2,$3)
RETURNING *
`,
[queue_id,customer_name,tokenNo]
);

io.emit("tokenCreated",token.rows[0]);

res.json(token.rows[0]);
};