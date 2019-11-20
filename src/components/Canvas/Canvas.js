import React, { Component } from "react";
import P5Wrapper from "react-p5-wrapper";
import axios from 'axios';
// import toBlob from 'canvas-toBlob';
import testImage from './testImage.png'

import "./Canvas.css";

class Canvas extends Component {
	constructor(props) {
		super(props);
		this.state = {
			drawing: [],
			submitted: false,
			prediction: ''
		};
		this.sketch = this.sketch.bind(this);
		this.fileUploadHandler = this.fileUploadHandler.bind(this)
	}

	// upload handler
	async fileUploadHandler(img) {
		console.log('inside fileuploadhandler')
		// console.log('hey we have the image', img)
		var canvasInput = document.getElementById('defaultCanvas0');
		// var testImage = canvasInput
		// console.log('canvas', testImage)
		// var dataURL = canvas.toDataURL();
		// console.log('testImage', testImage)
		// Convert canvas image to Base64
		var canvasImg = canvasInput.toDataURL()
		console.log(canvasImg)
		// Convert Base64 image to binary

		function dataURItoBlob(dataURI) {
			// convert base64/URLEncoded data component to raw binary data held in a string
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0)
				byteString = atob(dataURI.split(',')[1]);
			else
				byteString = unescape(dataURI.split(',')[1]);
			// separate out the mime component
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
			// write the bytes of the string to a typed array
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			return new Blob([ia], { type: mimeString });
		}


		var file = dataURItoBlob(canvasImg);
		console.log('file: ', file)


		// did the below work to make a blob????
		// var blob = new Blob([JSON.stringify(testImage, null, 2)], {type : 'application/json'});

		// console.log('blob', blob)

		// console.log('[1]', testImage[1])
		const fd = new FormData()
		fd.append('image', file, 'someName');

		var response = await axios.post('handwriting/', fd, {
			headers: {
				'content-type': 'multipart/form-data'
			}
		})
		// console.log('response: ', response, {
		//  headers: {
		//      'content-type': 'multipart/form-data'
		//  }
		// })

		console.log('response: ', response)
		this.setState({
			prediction: response.data
		})
		// console.log('canvas id element', canvas)

		// this function makes things super slow...
		// actually now it's fast 90% of the time what...

		// canvas.toBlob(function (blob) {
		//  saveAs(blob, "your-image.jpg");
		//  console.log('sup', blob)
		// });

		// console.log('final canvas', canvas, typeof canvas)

		// img = img.toBlob()
		// const fd = new FormData();
		// // academind - "React Image Upload Made Easy" - report progress @ 6:50 in video
		// fd.append('image', img, 'the_name_the_file_has')
		// var response = await axios.post('handwriting/', fd)

		// console.log(response)

	}

	// sketch function
	sketch = p => {
		var canvas;
		var drawings = [];
		var currentPath = [];
		var isDrawing = false;
		p.setup = () => {
			canvas = p.createCanvas(200, 150);
			p.noStroke();
			canvas.mousePressed(p.startPath);
			canvas.mouseReleased(p.endPath);
		};

		p.startPath = () => {
			isDrawing = true;
			currentPath = [];
			drawings.push(currentPath);
		};

		p.endPath = () => {
			isDrawing = false;
		};

		p.draw = () => {
			var px = p.mouseX;
			var py = p.mouseY;
			p.background(0);

			if (isDrawing) {
				let point = {
					x1: px,
					y1: py,
					x2: p.mouseX,
					y2: p.mouseY
				}
				currentPath.push(point);
				px = p.mouseX;
				py = p.mouseY;
			}

			//Shows the current drawing if there any data in drawing array
			for (let i = 0; i < drawings.length; i++) {
				let path = drawings[i];
				if (drawings[i].length != 0) {
					// p.beginShape();
					for (let j = 0; j < path.length; j++) {
						p.strokeWeight(20);
						p.stroke(255);
						p.line(path[j].x1, path[j].y1, path[j].x2, path[j].y2);
						// p.vertex(path[j].x2, path[j].y2);
					}
					// p.endShape();
				}
			}

			if (this.state.submitted === true) {
				console.log("we are ready to export");
				this.setState({
					submitted: false
				});
				// console.log(canvas);
				const img = canvas.get();
				// img.save();
				// console.log(img)
				this.fileUploadHandler(img)
			}
		};
	};

	handleOnClick = e => {
		e.preventDefault();
		this.setState({
			submitted: true
		});
		// console.log("submitted picture to backend");
	};

	render() {
		return (
			<div className="canvas">
				<h4 className="center">canvas here</h4>
				<div className="p5-canvas">
					<P5Wrapper className="P5Wrapper" sketch={this.sketch} />
				</div>
				<button
					className="btn waves-effect waves-light"
					type="submit"
					name="action"
					onClick={this.handleOnClick}> Submit</button>
				<p>Canvas Response: {this.state.prediction}</p>
			</div>
		);
	}
}

export default Canvas;
