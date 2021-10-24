import * as http from 'https';
import * as TelegramBot from 'node-telegram-bot-api';
import { WaterMark } from './watermark';
import { last } from 'lodash';

/** Telegram bot token */
const token = process.env['TELEGRAM_BOT_TOKEN'];

export class Bot {

    private botInstance: TelegramBot;

    private waterMark = new WaterMark();

    constructor() { 
        this.botInstance = new TelegramBot(token, {
            polling: true
        });

        this.botInstance.onText(/\/debug/, msg => {
            this.botInstance.sendMessage(msg.chat.id, JSON.stringify(msg, null, 4));
        });

        this.setupPhotoListener();
    }

    public setupPhotoListener() {
        this.botInstance.on('document', async msg => {
            console.log(msg);

            const chatId = msg.from.id;

            const fileId = msg.document.file_id;

            const fileName = msg.document.file_id;

            const fileMetaDataResponse = await this.botInstance.getFile(fileId);

            if ( fileMetaDataResponse instanceof Error ) {
                console.error('Someting went wrong fetching file metadata', fileMetaDataResponse);
            } else {
                this.handlePhoto(fileMetaDataResponse, chatId, fileName);
            }

        });

        this.botInstance.on('photo', async (msg) => {
            const chatId = msg.from.id;

            const lastPhoto: any = last(msg.photo);

            const fileMetaData = await this.botInstance.getFile(lastPhoto.file_id);
        
            console.log(fileMetaData);
            
            if (fileMetaData instanceof Error) {
                console.log('error getting file metadata');
            } else {
                this.handlePhoto(fileMetaData, chatId, fileMetaData.file_id);
            }

        });
    }


    private handlePhoto(fileMetaData: TelegramBot.File, chatId: number, fileName: string) {
        const fileUrl = `https://api.telegram.org/file/bot${token}/${fileMetaData.file_path}`;
        console.log('Photo received from', chatId, ' on ' + new Date() + 'url: ' + fileUrl);
        http.get(fileUrl, async (response) => {
            const buffer = await this.waterMark.toBuffer(response);
            const stream = await this.waterMark.perform(buffer, fileUrl);
            const newBuffer = await this.waterMark.toBuffer(stream);

            this.botInstance.sendPhoto(chatId, newBuffer);
        });
    }

    public sendMessage(message, receiver_ids: number[]): void {
        receiver_ids.forEach( async id => {
            try {
                await this.botInstance.sendMessage(id, message, {
                    disable_notification: true
                });
            } catch ( e ) {
                console.error(e);
            } 
        });
    }
}