class MTNFCTLV {
    constructor(Tag, Value) {
        this.Tag = Tag;
        this.Value = Value;
    }

    static parse(data) {
        let index = 0;
        const result = [];

        while (index < data.length) {
            const tag = data[index];
            index += 1;

            if (tag === 0xFE) { // terminator
                break;
            }

            const length1 = data[index];
            index += 1;

            let length = length1;
            if (length1 === 0xFF) {
                length = data[index] * 256 + data[index + 1];
                index += 2;
            }
            const valueEndIndex = index + length;

            const value = data.slice(index, valueEndIndex);
            index = valueEndIndex;
            result.push(new MTNFCTLV(tag, value));
        }

        return result;
    }
}


class NTag {
    /// use raw command to read/write ntag card
    /// @param sendNfc : an async function to send nfc command
    constructor(sendNfc) {
        if (typeof sendNfc === "undefined") {
            console.log("Need NFC command interface for NTAG class")
            throw Error("Need NFC command interface for NTAG class")
        }
        this.GET_VERSION = "60";
        this.READ = "30";
        this.FAST_READ = "3A";
        this.WRITE = "A2";
        this.sendNfc = sendNfc;
        this.userSize = 0;
    }

    async getVersion() {
        await this.sendNfc(this.GET_VERSION, false);
    }

    async getMemorySize() {
        if (this.userSize === 0) {
            const vhex = await this.readOne(0);
            this.userSize = vhex.length > 15 ? vhex[14] : 0;
        }
        return this.userSize * 8;
    }

    async readAll() {
        console.log("NTAG readAll");

        if (this.userSize === 0) {
            const vhex = await this.readOne(0);
            this.userSize = vhex.length > 15 ? vhex[14] : 0;
        } else {
            console.log("SIZE is " + this.userSize);
        }

        const readCount = 255 - 4; // read all in one shot

        if (this.userSize > 0) {
            const result = [];
            const lastBlock = this.userSize * 2 + 4 - 1;
            for (let start = 4; start < lastBlock; start += readCount) {
                const isLastRead = start + readCount > lastBlock;
                const endBlock = isLastRead ? lastBlock : start + readCount - 1;

                const value = await this.fastRead(start, endBlock, isLastRead);
                result.push(...value);
            }
            return result;
        } else {
            return [];
        }
    }

    async readNdef() {
        const all = await this.readAll();

        let tlvs = MTNFCTLV.parse(all);
        let messages = tlvs.map((tlv)=>NdefLibrary.NDefMessage.fromByteArray(tlv.Value));

        let records = [];
        
        messages.map(m=> records.concat( m.getRecords()) );

        var ndefMessage = NdefLibrary.NdefMessage.fromByteArray(all);
        return ndefMessage;
    }

    async writeAll(data) {
        const firstBlock = 4;
        const endBlock = Math.ceil(data.length / 4) + 4 - 1;
        if (endBlock > this.userSize * 2) {
            throw new Error("Data is more than tag maximum size");
        }

        let index = 0;
        let success = true;
        for (let block = firstBlock; block < endBlock; block++) {
            success = await this.writeOne(block, data.slice(index, index + 4));
            index += 4;
            if (!success) {
                break;
            }
        }

        if (success) {
            success = await this.writeOne(endBlock, data.slice(index), true);
        }

        return success;
    }

    /// @param records | message 
    async writeNdef(records) {
        const data = MTNdef.BuildNDEFMessage(records);
        return await this.writeAll(data);
    }

    async readOne(block, lastCommand = false) {
        console.log("Read block " + block);
        const hexBlock = block.toString(16).padStart(2, '0').toUpperCase();
        const vhex = await this.sendNfc(this.READ + hexBlock, lastCommand);
        return this.byteArrayFromHexString(vhex);
    }

    async fastRead(startBlock, endBlock, lastCommand = false) {
        const hexStartBlock = startBlock.toString(16).padStart(2, '0').toUpperCase();
        const hexEndBlock = endBlock.toString(16).padStart(2, '0').toUpperCase();
        const vhex = await this.sendNfc(this.FAST_READ + hexStartBlock + hexEndBlock, lastCommand);

        console.log("READ_READ - " + vhex);
        return this.byteArrayFromHexString(vhex);
    }

    async writeOne(block, data, lastCommand = false) {
        const hexStartBlock = block.toString(16).padStart(2, '0').toUpperCase();
        // Implementation for writing one block goes here
    }

    byteArrayFromHexString(hexString) {
        const result = [];
        for (let i = 0; i < hexString.length; i += 2) {
            result.push(parseInt(hexString.substr(i, 2), 16));
        }
        return result;
    }
}

