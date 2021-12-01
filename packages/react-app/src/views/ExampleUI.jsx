import { SyncOutlined } from "@ant-design/icons";
import { utils, BigNumber } from "ethers";
import { Button, Card, Col, Collapse, DatePicker, Divider, Form, Input, Progress, Row, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";
import {
  useContractLoader,
  useContractReader,
} from "eth-hooks";

import Arweave from 'arweave';

const { TextArea } = Input;
const { Meta } = Card;
const { Panel } = Collapse;

function CardRendering({text, name }) {
  return (
    <Card
      style={{ width: 380, margin: 'auto' }}
      cover={<AsciiSvg text={text} />}
    >
      <Meta
        title={name}
        description="Weavable Ascii Art on Arweave"
      />
    </Card>
  );
}

function AsciiSvg({text}) {
  return (<div style={{border: '1px solid black'}}>
        <svg width="380" height="350" xmlns="http://www.w3.org/2000/svg" >
          {text.split('\n').map((line, idx) => <text key={'svg-'+idx} x="0" y={8+10*idx} style={{whiteSpace: 'pre'}} fontSize='8px' fontFamily='monospace'>{line}</text>)}
        </svg></div>
  );
}
function asciiSvgString(text) {
  return `<svg width="380" height="350" xmlns="http://www.w3.org/2000/svg"><style>text { font-size: 8px; font-family: monospace; white-space: pre; }</style>${text.split('\n').map((line, idx) => `<text x="0" y="${8+10*idx}" >${line}</text>`).join('')}</svg>`;
}

function WeavableURI({ uri, }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [ext, setExt] = useState('');
  const [image, setImage] = useState('');
  useEffect(async () => {
    if (uri.split(':')[0] == 'https') { // XXX
      const response = await fetch(uri);
      const json = await response.json();
      console.log(json);
      setName(json.name);
      setDesc(json.description);
      setExt(json.external_url);
      setImage(json.image);
    }
  }, []);
  return (
    <Card
      style={{ width: 380, margin: 'auto' }}
      /*cover={<div dangerouslySetInnerHTML={{__html: image}} />}*/
      cover={<img src={image} />}
    >
      <Meta
        title={name}
        description={desc}
      />
      <div><a href={ext} target="_blank">Link</a></div>
    </Card>
  );
}

function MyWeavableByTokenId({ tokenId, readContracts, }) {
  const tokenURI = useContractReader(readContracts, "YourContract", "tokenURI", [tokenId]);

  return (
    <div>
      {tokenURI ? <WeavableURI uri={tokenURI} /> : ''}
    </div>
  );
}

function MyWeavableByIndex({ index, address, readContracts, }) {
  const tokenId = useContractReader(readContracts, "YourContract", "tokenOfOwnerByIndex", [address, index]);

  return (
    <div>
      <h3>Weavable {tokenId && tokenId.toString()}</h3>
      {tokenId ? <MyWeavableByTokenId tokenId={tokenId} readContracts={readContracts} /> : ''}
    </div>
  );
}

function MyWeavables({ address, readContracts, }) {
  const balance = useContractReader(readContracts, "YourContract", "balanceOf", [address]);

  return (
    <div>
      <h1>Your Weavables: ({balance && balance.toString()})</h1>
      {balance ? Object.keys([...Array(balance.toNumber())]).map(idx =>
        <MyWeavableByIndex
            index={parseInt(idx)}
            key={idx}
            address={address}
            readContracts={readContracts}
        />
      ) : ''}
    </div>
  );
}

export default function ExampleUI({
  address,
  mainnetProvider,
  localProvider,
  tx,
  readContracts,
  writeContracts,
  children
}) {

  const [newName, setNewName] = useState('name');
  const [newTokenId, setNewTokenId] = useState('only on localhost...');
  const [newAsciiArweaveTxid, setNewAsciiArweaveTxid] = useState('...');
  const [newSvgArweaveTxid, setNewSvgArweaveTxid] = useState('...');
  const [newMetaArweaveTxid, setNewMetaArweaveTxid] = useState('...');
  const [newHashLookup, setNewHashLookup] = useState('enter arweave hash id to look up');
  const getArweaveData = () => {
    arweave.transactions.getData(newHashLookup, {decode: true, string: true}).then(data => {
      console.log(data);
    });
  };
  const [newAscii, setNewAscii] = useState(`
  
   +                                             _____                  
      ____                                      /____/\\                 
     /___/\\      ____________ /\\___    ___/\\ ___\\ __ \\ \\    _________   
     \\   \\ \\  __/  /  ____  //  \\  \\  /  /  \\    \\ /  \\ \\ _/  ____  /   
      \\   \\ \\/ /  /  _)__/ //  / \\  \\/  / \\  \\    X___ \\ X_  _)__/ /___ 
       \\   \\/\\/  /   \\____//  /\\  \\  \\ /  /\\  \\  (____) X_\\  \\____/  _/ 
        \\   \\/  /________ /__/  \\__\\  /__/  \\__\\_   /______\\________/   
         \\__/\\_/  weavable ascii    \\/ beth_1   \\__/                    
                                                                     ot+
`);

  const arweave = Arweave.init({});

  useEffect(() => {
     async function setupArweave() {
       if (window.arweaveWallet) {
         let res = await window.arweaveWallet.connect(["DECRYPT", "ENCRYPT", "ACCESS_ADDRESS", "SIGN_TRANSACTION", "ACCESS_PUBLIC_KEY" ]);

         const {current} = await arweave.network.getInfo();
         console.log(current);
         const result = await arweave.blocks.getCurrent(); 
         console.log(result);

         arweave.wallets.jwkToAddress().then((address) => {
           console.log(address);
          
           arweave.wallets.getBalance(address).then((balance) => {
              let winston = balance;
              let ar = arweave.ar.winstonToAr(balance);

              console.log('winstons: ', winston);
              console.log('ar: ', ar);
          });
        });
       } else {
         setTimeout(setupArweave, 1000);
         console.log('retry arweave in 1s');
       }
     }
    setupArweave();
  }, [window]);

  const _postToArweave = async (data, type, onArweaveTxid) => {
    // arweave calls leave out key to use injected one from browser
    let transaction = await arweave.createTransaction({ data });
    // plain text // transaction.addTag('Content-Type', 'application/pdf');
    transaction.addTag('Content-Type', type);
    console.log('ar tx: ', transaction);
    onArweaveTxid(transaction.id);

    console.log('trying to sign...');
    await arweave.transactions.sign(transaction);

    // simple way
    //const response = await arweave.transactions.post(transaction);
    //console.log(response.status);

    console.log('getting status on ', transaction.id);
    let uploader = await arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

    arweave.transactions.getStatus(transaction.id).then(res => {
      console.log('got status: ', res);
      onArweaveTxid(transaction.id);
      // {
      //  status: 200,
      //  confirmed: {
      //    block_height: 140151,
      //    block_indep_hash: 'OR1wue3oBSg3XWvH0GBlauAtAjBICVs2F_8YLYQ3aoAR7q6_3fFeuBOw7d-JTEdR',
      //    number_of_confirmations: 20
      //  }
      //}
    })

    return transaction.id;
  };

  const metadataTemplate = {
    "description": "Weavable Ascii Art on Arweave",
    "external_url": "ar://R_Ef-giwN-oYEYeJkLTjU8Lle9U84GS14y-LlUw9x4g",
    "name": "Weavable #0000",
    "attributes": [ { "trait_type": "Lines", "value": 0 } ], 
  }
  const baseURI = "https://arweave.net/";
  const noAr = false;
  const dataToMetadataArweaveToMint = async () => {
    let arid = noAr ? '_wfGj6ww2Cy1irJw7hNt3TiDmqAtO151iD1MtL0t8N4' : await _postToArweave(newAscii, 'text/plain', setNewAsciiArweaveTxid);
    let svgArid = noAr ? '_wfGj6ww2Cy1irJw7hNt3TiDmqAtO151iD1MtL0t8N4' : await _postToArweave(asciiSvgString(newAscii), 'image/svg+xml', setNewSvgArweaveTxid);
    const meta = metadataTemplate;
    const lines = newAscii.split('\n').length;
    //meta.image_data = asciiSvgString(newAscii);
    meta.attributes[0].value = lines;
    meta.external_url = baseURI + arid;
    meta.image = baseURI + svgArid;
    meta.name = newName + " [Weavable]";
    let meta_arid = noAr ? 'UPRN3tYBNzJGwNlhp0ZwRZH-D12Lyflbqz8WIDgJNso' : await _postToArweave(JSON.stringify(meta), 'application/json', setNewMetaArweaveTxid);

    //
    const tokenURI = baseURI + meta_arid;
    const result = tx(writeContracts.YourContract.mint(tokenURI), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
      // assume this is the mint transfer event
      if (update && update.logs) {
        const tokenId = BigNumber.from(update.logs[0].topics[3]).toString();
        setNewTokenId(tokenId);
      } else {
        console.log('no logs: ', update);
      }
    });
    console.log("awaiting metamask/web3 confirm result...", result);
    const updateResult = await result;
    console.log(updateResult);
  };


  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, paddingBottom: 128, width: '80%', margin: "auto", marginTop: 64 }}>
        <h2>Weavable : Ascii Art on Arweave UI</h2>
        {/* <pre>{newAscii}</pre> */}

        <h3>Edit or paste your ascii art</h3>
        <div style={{marginBottom: 20}}>
          <TextArea rows={15} cols={80} value={newAscii} onChange={e => { setNewAscii(e.target.value); }} />
        </div>
        <div>
          <Form
            name="basic"
            labelCol={{
              span: 10,
            }}
            wrapperCol={{
              span: 6,
            }}
            initialValues={{
              remember: true,
            }}
            autoComplete="off"
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Give your artwork a name',
                },
              ]}
            >
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 4,
                span: 16,
              }}
            >
              <Button type="primary" htmlType="submit"
                onClick={dataToMetadataArweaveToMint}
              >
                Publish Art
              </Button>
            </Form.Item>
          </Form>
        </div>
        <Divider />
        <h3>Rendering of your NFT</h3>
        <CardRendering text={newAscii} name={newName} />
        <div>
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Arweave ID of ASCII" bordered={true}>
                {newAsciiArweaveTxid}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="ID of SVG" bordered={true}>
                {newSvgArweaveTxid}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="ID of metadata" bordered={true}>
                {newMetaArweaveTxid}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="NFT Token ID" bordered={true}>
                {newTokenId}
              </Card>
            </Col>
          </Row>
        </div>
        <Divider />
        <MyWeavables
            address={address}
            readContracts={readContracts}
        />
        <Divider />
        <Collapse>
          <Panel header="Arweave ID lookup" key="1">
            <div>
              <span>Dump Arweave hash/id: {newHashLookup}</span>
              <Input onChange={(e) => setNewHashLookup(e.target.value)} />
              <Button onClick={getArweaveData} >
                Look up hash and get data
              </Button>
             </div>
          </Panel>
          <Panel header="Debug Contract" key="2">
            {children}
          </Panel>
        </Collapse>
        <Divider />
      </div>
    </div>
  );
}
