import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, first, map } from 'rxjs/operators';

import  Quill  from 'quill';
import  ImageResize  from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);


@Component({
  selector: 'app-mock',
  templateUrl: './mock.component.html',
  styleUrls: ['./mock.component.css']
})
export class MockComponent implements OnInit {
  public lBtn = false;

  config = {
    placeholder: '',
    tabsize: 2,
    height: 320,
    uploadImagePath: '/api/upload',
    toolbar: [
        ['misc', ['codeview', 'undo', 'redo']],
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
        ['fontsize', ['fontname', 'fontsize', 'color']],
        ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
        ['insert', ['table', 'picture', 'link', 'video', 'hr']]
    ],
    fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times']
  }

  eform = new FormGroup({
    id: new FormControl(null),
    test_name: new FormControl('',Validators['required']),
    slug: new FormControl(''),
    status: new FormControl('draft'),
    instructions: new FormControl('', Validators['required']),
    levels: new FormControl(["easy","medium","hard"]),
    // durations: new FormControl('', Validators['required']),
    postive_mark: new FormControl('', Validators['required']),
    negetive_mark: new FormControl('', Validators['required']),
    category: new FormControl(''),
    total_score: new FormControl('', Validators['required']),
    total_questions: new FormControl('', Validators['required']),
    total_duration: new FormControl('', Validators['required'])

  });

  categoryList = [] as any;

  mockTests = [] as any;
  isUnique = [] as any;
  inLoop = false;


  constructor(
    private db: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.db.collection('mock_category').get().subscribe((querySnapshot) => {
      querySnapshot.forEach((data) => {
        const category = data.data() as any;
        let categoryObj = { ['slug']: category.slug, ['name']: category.mock_test_category }
        this.categoryList.push(categoryObj)
      })
      this.db.collection('mock_tests_new').snapshotChanges().subscribe((resp)=>{
      this.mockTests = [];
      resp.forEach((val)=>{
        const qObj = Object.assign({}, val.payload.doc.data(), { ['id']: val.payload.doc.id});
        this.mockTests.push(qObj);
      })
      console.log(this.mockTests)
      })
    })
  }

  onSubmit(){
  //  console.log(this.eform.value);
    this.lBtn = true;
   if(this.eform.invalid){
     alert('Enter all field');
     this.lBtn = false;
     return
   }else{
     if(this.eform.value.postive_mark > 0 && this.eform.value.negetive_mark >= 0 ){
       if(this.eform.value.id == null){

        const slug = this.string_to_slug(this.eform.value.test_name);
        this.inLoop = false;
        for(let i = 0; i<this.mockTests.length; i++){
          if(this.mockTests[i].slug === slug || this.mockTests[i].test_name === this.eform.value.test_name){
            this.isUnique.push(this.mockTests[i]);
            this.inLoop = true;
            alert('Mock test with same name already exists');
            this.lBtn = false;
            break;
          }
        }

        if(this.inLoop == false){
          this.isUnique =[];
        }

        if(this.isUnique.length === 0 ){
          // console.log(this.eform.value)
          this.db.collection('mock_tests_new').add({
            instructions: this.eform.value.instructions,
            // durations: this.eform.value.durations.split(','),
            levels: this.eform.value.levels,
            slug: slug,
            status: this.eform.value.status,
            test_name: this.eform.value.test_name,
            postive_mark: this.eform.value.postive_mark,
            negetive_mark: this.eform.value.negetive_mark,
            category: this.eform.value.category,
            total_score: this.eform.value.total_score,
            total_questions: this.eform.value.total_questions,
            total_duration: this.eform.value.total_duration

          }).then(resp => {
            this.eform.reset();
            this.lBtn = false;
          })
        }

       }else{
        this.db.doc('mock_tests_new/'+this.eform.value.id).update(this.eform.value).then(()=>{
          this.eform.reset();
          this.lBtn = false;
        })
      }

     }else{
       alert('Pls enter mark numbers in range');
       this.lBtn = false
     }
   }

  }

  edit(data:any){
    console.log(data);
    this.eform.patchValue({
      id: data.id,
      instructions: data.instructions,
      levels: data.levels,
      slug: data.slug,
      status: data.status,
      test_name: data.test_name,
      postive_mark: data.postive_mark,
      negetive_mark: data.negetive_mark,
      category: data.category,
      total_score: data.total_score,
      total_questions: data.total_questions,
      total_duration: data.total_duration
    })
  }

  publish(data:any){
    if(data.status !== 'public'){
      const test = [] as any
      this.db.collection('mock_tests_new').ref.where('slug','==', data.slug).get().then((resp)=>{
        resp.forEach((val:any)=>{
          test.push(val.id)
        })
      }).then(()=>{
        if(test.length == 1){
          const questions = [] as any
          this.db.collection('questions').ref.where('mock_test', 'array-contains' ,data.slug).get().then((resp)=>{
            resp.forEach((val:any)=>{
              questions.push(val.data())
            })
          }).then(()=>{
            if(questions.length == data.total_questions){
              this.db.doc('mock_tests_new/'+test[0]).update({
                status: 'public'
              })
            }else{
              let conf = confirm('Total no of question is not achieved. Are you sure to publish? This will create wrong calculations in mock test !!!')
              if(conf == true){
                this.db.doc('mock_tests_new/'+test[0]).update({
                  status: 'public'
                })
              }
            }
          })
        }else{
          alert('mutliple test with same name | Contact admin')
        }
      })
    }else if(data.status === 'public'){
     let conf =  confirm('Are you sure to unpublish it ?');
     if(conf == true){
      const test = [] as any
      this.db.collection('mock_tests_new').ref.where('slug','==', data.slug).get().then((resp)=>{
        resp.forEach((val:any)=>{
          test.push(val.id)
        })
      }).then(()=>{
        if(test.length == 1){
          this.db.doc('mock_tests_new/'+test[0]).update({
            status: 'draft'
          })
        }else{
          alert('mutliple test with same name | Contact admin')
        }
      })
     }
    }

  }



  string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ""); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaaaeeeeiiiioooouuuunc------";

    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    str = str
      .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
      .replace(/\s+/g, "-") // collapse whitespace and replace by -
      .replace(/-+/g, "-") // collapse dashes
      .replace(/^-+/, "") // trim - from start of text
      .replace(/-+$/, ""); // trim - from end of text

    return str;
  }

}
