# PEAT

PEAT is a portable, standalone application built off the Electron software framework and can be used on all major operating systems (Windows, Linux, and Macintosh) and provides an interface for users to annotate PDFs.

PEAT was designed to take advantage of the latest advancements in PDF text extraction methods while also allowing the user to annotate and label the data directly in PDF format. This approach allows a user to work in a document structure they are familiar with, improving the user experience and facilitating the creation of labeled data for machine consumption and training of future machine learning models.

The application allows users to load PDFs directly from their file system along with data annotation forms with standard or customizable annotation types, labels, entities, and other features such as custom color highlighting. The application also includes features for users to edit and import/export data extraction schemas, export annotations of X and Y PDF coordinal structure (based on the image layer of the PDF), search and manipulate annotations, and save/load progress. Once a user has completed document annotation, the labeled data, full text, and all associated metadata is exportable in JSON format that can be processed by a variety of NLP model building applications such as Spacy or PyTorch.

# Installation

<details>
<summary>Windows</summary>

1\. Download latest version from (PEAT_1.1.0)

[https://github.com/USEPA/peat/releases/download/v1.0.1-win/peat-1.0.1.zip](https://github.com/USEPA/peat/releases/download/v1.0.1-win/peat-1.0.1.zip)

2\. Right click 'peat-1.0.1.zip' and select 'Extract All'

---

![](./media/image4.png)

---

3\. Select location and hit _Extract_

---

![](./media/image5.png)

---

4\. From the extracted location double click the *PANDHA_1.1.0*Folder

---

![](./media/image6.png)

---

5\. Double click _PEAT.exe_ to start the application

---

![](./media/image7.png)

---

7\. Select the PDF and Schema (tags.json is including in the PEAT/test
folder) and click _Load_

---

![](./media/image8.png)

---

---

</details>

<details>
<summary>Linux/Mac</summary>

1.  Clone the repo
    `git clone https://github.com/USEPA/peat.git`

2.  Install and download the following prerequisites.

NodeJS: https://nodejs.org/
Yarn: https://yarnpkg.com/

3. In the PEAT directory run yarn to download the depdencies.

`yarn`

4. Run the application

`yarn start`

## 1.3 Packageing

1. In order to build a standalone application for you system run.

`yarn package`

This will create a release folder providing multiple application versions.

</details>
</br>

# Application Usage

<details>
<summary>Load PDF</summary>

1.  Click _File_ in the menu bar and select _Load PDF_.

---

![Graphical user interface, text, application, Word Description
  automatically
  generated](./media/image9.png)

---

2.  Select the PDF file from your computer and click _Open_.

---

![Graphical user interface, application Description automatically
  generated](./media/image10.png)

---

---

![Graphical user interface, text, application, Word Description
  automatically generated](./media/image11.png)

---

---

</details>

<details>
<summary>Annotate PDF</summary>

1.  Highlight text you wish to annotate and select _Add Annotation_.

---

![Graphical user interface, text, application Description automatically
  generated](./media/image12.png)

---

---

2.  Select the annotation type.

---

![](./media/image13.png)

---

---

3.  Hit save

---

![Graphical user interface, text, application Description automatically
  generated](./media/image14.png)

---

---

---

![](./media/image15.png)

---

---

</details>

<details>
<summary>Save Annotations</summary>

1.  Click _File_ in the menu bar and select _Save Annotations_.

---

![Graphical user interface, text, application Description automatically
  generated](./media/image16.png)

---

---

2.  Select a save location on your computer and click _Save Annot File_.

---

![Graphical user interface, application Description automatically
  generated](./media/image17.png)

---

---

</details>

<details>
<summary>Load Annotations</summary>
1.  Click *File* in the menu bar and select *Load Annotations*.

---

![Graphical user interface, text, application, Word Description
  automatically generated](./media/image18.png)

---

---

2.  Select an annotation file and click _Open_

---

![Graphical user interface, text Description automatically
  generated](./media/image19.png)

---

---

---

![Graphical user interface, text, application Description automatically
  generated](./media/image20.png)

---

---

</details>

<details>
<summary>Delete Annotations</summary>
1\. Select annotation you wish to delete from the table in the side bar.

---

![Graphical user interface, text, application, Word Description
  automatically generated](./media/image21.png)

---

---

2\. Click _Delete selected row_ button.

---

![Graphical user interface, text, application, Word Description
  automatically generated](./media/image22.png)

---

---

</details>

<details>
<summary>Edit Schema</summary>
1\. Click *Edit Schema* hyper-link

---

![Graphical user interface Description automatically
  generated](./media/image23.png)

---

---

- Change existing entity

  - Click the text of any entity to edit that entities type.

  - Click the color selector to change the annotation color.

  - Click the trash can icon to delete that entity.

- Add new entity type

  - Click Add Entity Type to add a new entity.

- Save changes

  - Click the Save button.

</details>

<details>
<summary>Auto Annotation</summary>
1\. Type word or phrase to be searched for in *Find in document* search
bar

---

![Graphical user interface, text, application Description automatically
  generated](./media/image24.png)

---

---

2\. Using the arrows (Up or Down) a yellow highlight will cycle through
matches found in the document.

3\. Select entity type from the dropdown box.

---

![Graphical user interface, text, application, Word Description
  automatically generated](./media/image25.png)

---

---

4\. Click Annotate to add an annotation for the current selection.

---

![Graphical user interface, text, application Description automatically
  generated](./media/image26.png)

---

---

</details>
</br>

# Contributing

There are many ways you can contribute to PEAT, such as:

- Reporting bugs or suggesting enhancements
- Improving the documentation or the user interface
- Adding new features or functionalities
- Writing tests or fixing issues
- Reviewing or commenting on pull requests or issues

To get started, you will need to fork the PEAT repository and clone it to your local machine. You will also need to install Node.js and Yarn to run and build the application. Please follow the instructions in the README file for more details.

If you encounter a bug or have a suggestion for an enhancement, please open an issue on git. Please provide as much information as possible to help us reproduce and resolve the issue. Please also check if there are any existing issues or pull requests that are similar to yours before opening a new one.
